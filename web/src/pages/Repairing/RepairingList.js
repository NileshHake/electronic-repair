/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Container,
  Row,
  Button,
  Col,
  Card,
  CardHeader,
  CardBody,
  Label,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import RepairingAdd from "./RepairingAdd";
import RepairingUpdate from "./RepairingUpdate";
import Flatpickr from "react-flatpickr";
import Select from "react-select";

import {
  deleteRepair,
  getRepairList,
  resetAddRepairResponse,
  resetDeleteRepairResponse,
  resetUpdateRepairResponse,
} from "../../store/Repairing/index";
import { getWorkflowList, getWorkflowStageList } from "../../store/Workflow";
import AuthUser from "../../helpers/AuthType/AuthUser";
import RepairBoard from "./RepairComponent/RepairBoard";

const LIMIT = 20;

const RepairList = () => {
  const { permissions } = AuthUser();
  const dispatch = useDispatch();

  const {
    repairs = [],
    total = 0,
    addRepairResponse,
    DeleteRepairResponse,
    updateRepairResponse,
    loading = false,
  } = useSelector((state) => state.RepairReducer) || {};

  const { workflows = [], workflowStages = [] } =
    useSelector((state) => state.WorkflowReducer) || {};

  // ================== LOCAL STATE ==================
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [page, setPage] = useState(1);

  const [filterData, setfilterData] = useState({
    start_date: new Date(),
    end_date: new Date(),
    workflow_id: 0,
    stage_id: 0,
    customer_search: "",
  });

  // ================== PERMISSIONS ==================
  const canUpdate = useMemo(() => {
    return permissions?.some(
      (p) =>
        (p.permission_category === "REPAIRING" ||
          p.permission_category === "REPAIRINGCUSTOMER") &&
        String(p.permission_path) === "3"
    );
  }, [permissions]);

  const canDelete = useMemo(() => {
    return permissions?.some(
      (p) =>
        (p.permission_category === "REPAIRING" ||
          p.permission_category === "REPAIRINGCUSTOMER") &&
        String(p.permission_path) === "4"
    );
  }, [permissions]);

  const canAdd = useMemo(() => {
    return permissions?.some(
      (p) =>
        (p.permission_category === "REPAIRING" ||
          p.permission_category === "REPAIRINGCUSTOMER") &&
        String(p.permission_path) === "2"
    );
  }, [permissions]);

  // ================== INITIAL FETCH ==================
  useEffect(() => {
    dispatch(getWorkflowList());
    dispatch(resetAddRepairResponse());
  }, [dispatch]);

  // ✅ set default workflow once loaded
  useEffect(() => {
    if (workflows.length > 0 && !filterData.workflow_id) {
      setfilterData((prev) => ({
        ...prev,
        workflow_id: workflows[0].workflow_id,
      }));
    }
  }, [workflows]);

  // ✅ load stages when workflow changes
  useEffect(() => {
    if (filterData.workflow_id) {
      dispatch(getWorkflowStageList(filterData.workflow_id));
    }
  }, [filterData.workflow_id, dispatch]);

  // ✅ whenever filters change -> reset page + fetch page 1
  useEffect(() => {
    if (!filterData.workflow_id) return;

    setPage(1);

    dispatch(
      getRepairList({
        ...filterData,
        page: 1,
        limit: LIMIT,
      })
    );
  }, [
    filterData.workflow_id,
    filterData.stage_id,
    filterData.start_date,
    filterData.end_date,
    filterData.customer_search,
    dispatch,
  ]);

  // ✅ after add/update/delete -> refresh page 1
  useEffect(() => {
    if (addRepairResponse || updateRepairResponse || DeleteRepairResponse) {
      dispatch(
        getRepairList({
          ...filterData,
          page: 1,
          limit: LIMIT,
        })
      );
      setPage(1);

      if (addRepairResponse) dispatch(resetAddRepairResponse());
      if (updateRepairResponse) dispatch(resetUpdateRepairResponse());
      if (DeleteRepairResponse) dispatch(resetDeleteRepairResponse());
    }
  }, [
    addRepairResponse,
    updateRepairResponse,
    DeleteRepairResponse,
    dispatch,
    filterData,
  ]);

  // ================== DELETE LOGIC ==================
  const onClickDelete = (repair) => {
    setSelectedRepair(repair);
    setDeleteModal(true);
  };

  const handleDeleteRepair = () => {
    if (selectedRepair?.repair_id) {
      dispatch(deleteRepair(selectedRepair.repair_id));
      setDeleteModal(false);
    }
  };

  // ================== KEYBOARD SHORTCUTS ==================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsAddModalOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ================== TITLE ==================
  useEffect(() => {
    document.title = "Repair List";
  }, []);

  // ================== INFINITE SCROLL fetch next ==================
  const fetchNextPage = useCallback(() => {
    const next = page + 1;
    setPage(next);

    dispatch(
      getRepairList({
        ...filterData,
        page: next,
        limit: LIMIT,
      })
    );
  }, [page, dispatch, filterData]);

  const hasMore = repairs.length < Number(total || 0);

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} autoClose={800} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRepair}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <Row className="align-items-center gy-3">
          <Col lg={12}>
            <Card className="p-3">
              {/* === Header === */}
              <CardHeader className="border-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end gap-2">
                    {/* === Workflow === */}
                    <div className="w-100 w-sm-auto" style={{ minWidth: 220 }}>
                      <Label className="form-label mb-1">Workflow</Label>
                      <Select
                        className="w-100"
                        value={
                          workflows
                            .filter(
                              (f) =>
                                Number(f.workflow_id) ===
                                Number(filterData.workflow_id)
                            )
                            .map((w) => ({
                              label: w.workflow_name,
                              value: w.workflow_id,
                            }))[0] || null
                        }
                        options={workflows.map((w) => ({
                          label: w.workflow_name,
                          value: w.workflow_id,
                        }))}
                        onChange={(selected) =>
                          setfilterData((prev) => ({
                            ...prev,
                            workflow_id: selected?.value || 0,
                            stage_id: 0,
                          }))
                        }
                        placeholder="Select Workflow..."
                      />
                    </div>

                    {/* === Stage === */}
                    <div className="w-100 w-sm-auto" style={{ minWidth: 220 }}>
                      <Label className="form-label mb-1">Stage</Label>
                      <Select
                        className="w-100"
                        value={
                          (filterData.stage_id === 0
                            ? { label: "All Stages", value: 0 }
                            : workflowStages
                                .filter(
                                  (s) =>
                                    Number(s.workflow_child_id) ===
                                    Number(filterData.stage_id)
                                )
                                .map((s) => ({
                                  label: s.workflow_stage_name,
                                  value: s.workflow_child_id,
                                }))[0]) || { label: "All Stages", value: 0 }
                        }
                        options={[
                          { label: "All Stages", value: 0 },
                          ...workflowStages.map((s) => ({
                            label: s.workflow_stage_name,
                            value: s.workflow_child_id,
                          })),
                        ]}
                        onChange={(selected) =>
                          setfilterData((prev) => ({
                            ...prev,
                            stage_id: selected?.value ?? 0,
                          }))
                        }
                        placeholder="Select Stage..."
                        isDisabled={!filterData.workflow_id}
                      />
                    </div>

                    {/* === Start Date === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">Start Date</Label>
                      <Flatpickr
                        className="form-control w-100"
                        value={filterData.start_date}
                        onChange={(selectedDates) => {
                          if (selectedDates?.[0]) {
                            setfilterData((prev) => ({
                              ...prev,
                              start_date: selectedDates[0],
                            }));
                          }
                        }}
                        options={{
                          dateFormat: "d/m/Y",
                          altInput: true,
                          altFormat: "d/m/Y",
                        }}
                        placeholder="Start Date"
                      />
                    </div>

                    {/* === End Date === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">End Date</Label>
                      <Flatpickr
                        className="form-control w-100"
                        value={filterData.end_date}
                        onChange={(selectedDates) => {
                          if (selectedDates?.[0]) {
                            setfilterData((prev) => ({
                              ...prev,
                              end_date: selectedDates[0],
                            }));
                          }
                        }}
                        options={{
                          dateFormat: "d/m/Y",
                          altInput: true,
                          altFormat: "d/m/Y",
                        }}
                        placeholder="End Date"
                      />
                    </div>

                    {/* === Customer Search === */}
                    <div className="w-100 w-sm-auto">
                      <Label className="form-label mb-1">Customer</Label>
                      <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search Customer..."
                        value={filterData.customer_search || ""}
                        onChange={(e) =>
                          setfilterData((prev) => ({
                            ...prev,
                            customer_search: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* === Add Repair Button === */}
                    {canAdd && (
                      <div className="w-100 w-sm-auto">
                        <Label className="form-label mb-1 d-none d-sm-block">
                          &nbsp;
                        </Label>
                        <Button
                          color="success"
                          className="w-100"
                          onClick={() => setIsAddModalOpen(true)}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          + Add Repair
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* === Body === */}
              <CardBody className="p-2">
                <RepairBoard
                  repairs={repairs}
                  workflowStages={workflowStages}
                  permissions={permissions}
                  canDelete={canDelete}
                  setSelectedRepair={setSelectedRepair}
                  setIsUpdateModalOpen={setIsUpdateModalOpen}
                  onClickDelete={onClickDelete}
                  canUpdate={canUpdate}
                  filterData={filterData}
                  total={total}
                  loading={loading}
                  hasMore={hasMore}
                  fetchNextPage={fetchNextPage}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ================== ADD MODAL ================== */}
      {isAddModalOpen && (
        <RepairingAdd
          isOpen={isAddModalOpen}
          toggle={() => setIsAddModalOpen(false)}
        />
      )}

      {/* ================== UPDATE MODAL ================== */}
      {isUpdateModalOpen && (
        <RepairingUpdate
          isOpen={isUpdateModalOpen}
          toggle={() => setIsUpdateModalOpen(false)}
          isRepairData={selectedRepair}
        />
      )}
    </div>
  );
};

export default RepairList;
