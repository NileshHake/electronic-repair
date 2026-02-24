import React, { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import Select from "react-select";

import {
  getQuotationsList,
  updateQuotationMaster,
  resetUpdateQuotationMasterResponse,
} from "../../store/Inquiry";

import QuotationViewModal from "./QuotationViewModal";

const PAGE_SIZE = 10;

/**
 * Status Flow:
 * 1 = New
 * 2 = Accept
 * 5 = In Progress
 * 3 = Final
 * 4 = Reject
 */
const STATUS = {
  NEW: 1,
  ACCEPT: 2,
  IN_PROGRESS: 5,
  FINAL: 3,
  REJECT: 4,
};

const filterStatusOptions = [
  { label: "All", value: 0 },
  { label: "New", value: STATUS.NEW },
  { label: "Accept", value: STATUS.ACCEPT },
  { label: "In Progress", value: STATUS.IN_PROGRESS },
  { label: "Final", value: STATUS.FINAL },
  { label: "Reject", value: STATUS.REJECT },
];

// For showing current value (label mapping)
const rowStatusOptionsAll = [
  { label: "New", value: STATUS.NEW },
  { label: "Accept", value: STATUS.ACCEPT },
  { label: "In Progress", value: STATUS.IN_PROGRESS },
  { label: "Final", value: STATUS.FINAL },
  { label: "Reject", value: STATUS.REJECT },
];

// ✅ FLOW OPTIONS per current status
const getRowOptionsByFlow = (currentStatus) => {
  const s = Number(currentStatus);

  // If rejected or final, you can lock it (only show itself)
  if (s === STATUS.FINAL || s === STATUS.REJECT) {
    return rowStatusOptionsAll.filter((o) => o.value === s);
  }

  // New -> only allow Accept or Reject
  if (s === STATUS.NEW) {
    return rowStatusOptionsAll.filter((o) =>
      [STATUS.NEW, STATUS.ACCEPT, STATUS.REJECT].includes(o.value)
    );
  }

  // Accept -> only allow In Progress or Reject
  if (s === STATUS.ACCEPT) {
    return rowStatusOptionsAll.filter((o) =>
      [STATUS.ACCEPT, STATUS.IN_PROGRESS, STATUS.REJECT].includes(o.value)
    );
  }

  // In Progress -> only allow Final or Reject
  if (s === STATUS.IN_PROGRESS) {
    return rowStatusOptionsAll.filter((o) =>
      [STATUS.IN_PROGRESS, STATUS.FINAL, STATUS.REJECT].includes(o.value)
    );
  }

  // default fallback
  return rowStatusOptionsAll;
};

const InquiryList = () => {
  document.title = "Inquiry List";

  const dispatch = useDispatch();

  const { quotations, loading, updateQuotationMasterResponse } = useSelector(
    (state) => state.QuotationReducer
  );

  const [statusFilter, setStatusFilter] = useState(filterStatusOptions[0]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef(null);

  const [rows, setRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const buildListPayload = (pageNo, filterOpt) => ({
    page: pageNo,
    limit: PAGE_SIZE,
    quotation_status: Number(filterOpt?.value || 0) === 0 ? "" : Number(filterOpt.value),
  });

  /* ================= FIRST LOAD ================= */
  useEffect(() => {
    dispatch(getQuotationsList(buildListPayload(1, statusFilter)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  /* ================= MERGE LIST FOR INFINITE ================= */
  useEffect(() => {
    if (!Array.isArray(quotations)) return;

    if (page === 1) {
      setRows(quotations);
    } else {
      setRows((prev) => {
        const map = new Map(prev.map((x) => [x.quotation_id, x]));
        quotations.forEach((q) => map.set(q.quotation_id, q));
        return Array.from(map.values());
      });
    }

    if (quotations.length < PAGE_SIZE) setHasMore(false);
  }, [quotations, page]);

  /* ================= INFINITE SCROLL ================= */
  const handleScroll = () => {
    const el = tableRef.current;
    if (!el || loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(getQuotationsList(buildListPayload(nextPage, statusFilter)));
    }
  };

  /* ================= FILTER CHANGE ================= */
  const onChangeStatusFilter = (opt) => {
    setStatusFilter(opt);

    setPage(1);
    setHasMore(true);
    setRows([]);

    dispatch(getQuotationsList(buildListPayload(1, opt)));
  };

  /* ================= UPDATE STATUS (ENFORCE FLOW) ================= */
  const onChangeRowStatus = (q, selected) => {
    if (!selected?.value) return;

    const newStatus = Number(selected.value);
    const oldStatus = Number(q.quotation_status);

    // ✅ 1) Same status -> do nothing
    if (oldStatus === newStatus) return;

    // ✅ 2) Enforce flow
    const allowedOptions = getRowOptionsByFlow(oldStatus);
    const allowedValues = new Set(allowedOptions.map((o) => o.value));

    if (!allowedValues.has(newStatus)) {
      // If someone hacks select or stale UI, just ignore
      return;
    }

    // ✅ 3) Update API
    dispatch(
      updateQuotationMaster({
        quotation_id: q.quotation_id,
        quotation_status: newStatus,
      })
    );

    // ✅ 4) If filtered list (not All) and status changed -> remove instantly
    const currentFilter = Number(statusFilter?.value || 0);
    if (currentFilter !== 0 && currentFilter !== newStatus) {
      setRows((prev) => prev.filter((x) => x.quotation_id !== q.quotation_id));
    }

    // ✅ Optional: optimistic update current row status
    setRows((prev) =>
      prev.map((x) =>
        x.quotation_id === q.quotation_id ? { ...x, quotation_status: newStatus } : x
      )
    );
  };

  /* ================= AFTER UPDATE SUCCESS: REFRESH LIST ================= */
  useEffect(() => {
    if (updateQuotationMasterResponse) {
      setPage(1);
      setHasMore(true);
      setRows([]);

      dispatch(getQuotationsList(buildListPayload(1, statusFilter)));

      dispatch(resetUpdateQuotationMasterResponse());
    }
  }, [updateQuotationMasterResponse, dispatch, statusFilter]);

  const openViewModal = (q) => {
    setSelectedQuotation(q);
    setModalOpen(true);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={800} />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Inquiry List</h5>
                  </div>

                  <div className="col-sm-auto d-flex gap-2 align-items-center">
                    <div style={{ minWidth: 220 }}>
                      <Select
                        value={statusFilter}
                        onChange={onChangeStatusFilter}
                        options={filterStatusOptions}
                        isSearchable
                        placeholder="Select Status"
                      />
                    </div>

                    <Button color="success" onClick={() => alert("Open Add Modal")}>
                      + Add Inquiry
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                  ref={tableRef}
                  onScroll={handleScroll}
                >
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th>Quotation No</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Update Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows && rows.length > 0 ? (
                        rows.map((q, index) => {
                          const currentStatus = Number(q.quotation_status);

                          const valueObj =
                            rowStatusOptionsAll.find((opt) => opt.value === currentStatus) || null;

                          const allowedOptions = getRowOptionsByFlow(currentStatus);

                          return (
                            <tr key={q.quotation_id || index}>
                              <td>{index + 1}</td>

                              <td className="fw-semibold text-primary">
                                {q.quotation_no || `#${q.quotation_id}`}
                              </td>

                              <td>{q.customer_name || "-"}</td>

                              <td className="fw-bold">₹ {Number(q.grand_total || 0).toFixed(2)}</td>

                              <td style={{ minWidth: "180px" }}>
                                <Select
                                  options={allowedOptions}
                                  isSearchable={false}
                                  placeholder="Select"
                                  value={valueObj}
                                  onChange={(selected) => onChangeRowStatus(q, selected)}
                                  isDisabled={
                                    currentStatus === STATUS.FINAL || currentStatus === STATUS.REJECT
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: "32px",
                                      fontSize: "13px",
                                    }),
                                  }}
                                />
                              </td>

                              <td className="text-center">
                                <ul className="list-inline hstack mb-0 justify-content-center">
                                  <li className="list-inline-item edit">
                                    <button
                                      className="text-primary d-inline-block edit-item-btn border-0 bg-transparent"
                                      onClick={() => openViewModal(q)}
                                    >
                                      <i className="ri-eye-fill fs-16" />
                                    </button>
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          );
                        })
                      ) : !loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <div className="mt-4">
                              <h5>No Inquiry Found</h5>
                            </div>
                          </td>
                        </tr>
                      ) : null}

                      {loading && (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <div className="mt-4">
                              <h5>Loading...</h5>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {modalOpen && (
        <QuotationViewModal
          isOpen={modalOpen}
          toggle={() => setModalOpen(!modalOpen)}
          quotation={selectedQuotation}
        />
      )}
    </div>
  );
};

export default InquiryList;