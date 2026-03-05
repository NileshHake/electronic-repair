import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Badge,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label
} from "reactstrap";

import RentalRequestViewModal from "./RentalRequestViewModal";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import InfiniteScroll from "react-infinite-scroll-component";

import {
    getRentalRequestList,
    deleteRentalRequest,
    updateRentalRequestStatus,
} from "../../store/RentalRequest";

import DeleteModal from "../../Components/Common/DeleteModal";

const RentalRequestList = () => {

    document.title = "Rental Request List";

    const dispatch = useDispatch();

    const { rentalRequests = [] } = useSelector(
        (state) => state.RentalRequestReducer
    );

    const [cancelModal, setCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelRequestId, setCancelRequestId] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        status: ""
    });

    /* ================= STATUS LIST ================= */

    const orderStatus = [
        { label: "Pending", value: 0, color: "#e5ba0e" },
        { label: "Accepted", value: 1, color: "#28a745" },
        { label: "Shipped", value: 2, color: "#17a2b8" },
        { label: "Active", value: 3, color: "#6f42c1" },
        { label: "Cancelled", value: 4, color: "#dc3545" },
        { label: "Expired", value: 5, color: "#6c757d" },
        { label: "Returned", value: 6, color: "#20c997" }
    ];

    /* ================= FETCH LIST ================= */

    useEffect(() => {
        fetchList(1);
    }, []);

    const fetchList = (pageNo = 1) => {

        const payload = {
            page: pageNo,
            start_date: filters.start_date,
            end_date: filters.end_date,
            status: filters.status
        };

        dispatch(getRentalRequestList(payload));

    };

    /* ================= DETECT END ================= */

    useEffect(() => {

        if (rentalRequests.length === 0) {
            setHasMore(false);
        }

    }, [rentalRequests]);

    /* ================= INFINITE SCROLL ================= */

    const fetchMoreData = () => {

        const nextPage = page + 1;

        setPage(nextPage);

        fetchList(nextPage);

    };

    /* ================= DELETE ================= */

    const onClickDelete = (req) => {
        setSelectedRequest(req);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (selectedRequest) {
            dispatch(deleteRentalRequest(selectedRequest.rental_request_id));
        }
        setDeleteModal(false);
    };

    /* ================= STATUS BADGE ================= */

    const statusBadge = (status) => {

        const s = String(status || "").toLowerCase();

        if (s === "approved")
            return <Badge color="success">Approved</Badge>;

        if (s === "rejected")
            return <Badge color="danger">Rejected</Badge>;

        return <Badge color="warning">Pending</Badge>;

    };

    const getAllowedStatus = (currentStatus) => {

        switch (currentStatus) {

            case 0:
                return orderStatus.filter(s => [1, 4].includes(s.value));

            case 1:
                return orderStatus.filter(s => [2, 4].includes(s.value));

            case 2:
                return orderStatus.filter(s => [3].includes(s.value));

            case 3:
                return orderStatus.filter(s => [6].includes(s.value));

            case 6:
                return orderStatus.filter(s => [5].includes(s.value));

            default:
                return [];

        }

    };

    const selectStyles = {

        control: (styles, { selectProps }) => ({
            ...styles,
            backgroundColor: selectProps.value?.color + "20",
            borderColor: selectProps.value?.color,
            minHeight: "35px"
        }),

        option: (styles, { data, isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected
                ? data.color
                : isFocused
                    ? data.color
                    : "#fff",
            color: isSelected || isFocused ? "#fff" : "#333"
        }),

        singleValue: (styles, { data }) => ({
            ...styles,
            color: data.color,
            fontWeight: 600
        })

    };

    /* ================= FILTER ================= */

    const applyFilter = () => {

        setPage(1);
        setHasMore(true);

        fetchList(1);

    };

    const clearFilter = () => {

        setFilters({
            start_date: "",
            end_date: "",
            status: ""
        });

        setPage(1);
        setHasMore(true);

        fetchList(1);

    };

    const refresh = () => {

        setPage(1);
        setHasMore(true);

        fetchList(1);

    };

    /* ================= CANCEL ================= */

    const handleCancelSubmit = () => {

        dispatch(
            updateRentalRequestStatus({
                rental_request_id: cancelRequestId,
                request_status: 4,
                cancel_reason: cancelReason
            })
        );

        setCancelModal(false);
        setCancelReason("");

    };

    return (

        <div className="page-content">

            <Container fluid>

                <Row>
                    <Col lg={12}>

                        <Card>

                            <CardHeader className="border-0">

                                <Row className="align-items-center gy-3">

                                    <div className="col-sm">
                                        <h5 className="fw-bold mb-0">
                                            Rental Request List
                                        </h5>
                                    </div>

                                    <Col md="9" className="ms-auto">

                                        <Row className="align-items-end g-2 justify-content-end">

                                            <Col md="2">

                                                <Label className="form-label fw-bold mb-1">
                                                    Status
                                                </Label>

                                                <Select
                                                    options={orderStatus}
                                                    isClearable
                                                    value={orderStatus.find(s => s.value === filters.status)}
                                                    onChange={(e) =>
                                                        setFilters((p) => ({
                                                            ...p,
                                                            status: e ? e.value : ""
                                                        }))
                                                    }
                                                />

                                            </Col>

                                            <Col md="3">

                                                <Label className="form-label fw-bold mb-1">
                                                    Start Date
                                                </Label>

                                                <Flatpickr
                                                    className="form-control"
                                                    placeholder="Start date"
                                                    options={{ dateFormat: "Y-m-d" }}
                                                    value={filters.start_date}
                                                    onChange={([date]) =>
                                                        setFilters((p) => ({
                                                            ...p,
                                                            start_date: date
                                                                ? date.toISOString().slice(0, 10)
                                                                : ""
                                                        }))
                                                    }
                                                />

                                            </Col>

                                            <Col md="3">

                                                <Label className="form-label fw-bold mb-1">
                                                    End Date
                                                </Label>

                                                <Flatpickr
                                                    className="form-control"
                                                    placeholder="End date"
                                                    options={{ dateFormat: "Y-m-d" }}
                                                    value={filters.end_date}
                                                    onChange={([date]) =>
                                                        setFilters((p) => ({
                                                            ...p,
                                                            end_date: date
                                                                ? date.toISOString().slice(0, 10)
                                                                : ""
                                                        }))
                                                    }
                                                />

                                            </Col>

                                            <Col md="4" className="d-flex gap-2 justify-content-end">

                                                <Button color="success" className="mt-auto" onClick={applyFilter}>
                                                    Apply
                                                </Button>

                                                <Button color="secondary" className="mt-auto" onClick={clearFilter}>
                                                    Clear
                                                </Button>

                                                <Button color="primary" className="mt-auto" onClick={refresh}>
                                                    Refresh
                                                </Button>

                                            </Col>

                                        </Row>

                                    </Col>

                                </Row>

                            </CardHeader>

                            <CardBody>

                                <InfiniteScroll
                                    dataLength={rentalRequests.length}
                                    next={fetchMoreData}
                                    hasMore={hasMore}
                                    loader={<h6 className="text-center">Loading...</h6>}
                                >

                                    <div className="table-responsive">

                                        <table className="table align-middle table-hover">

                                            <thead className="table-light text-uppercase text-muted">

                                                <tr>
                                                    <th>#</th>
                                                    <th>Customer</th>
                                                    <th>Device</th>
                                                    <th>Rent Type</th>
                                                    <th>Duration</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Action</th>
                                                </tr>

                                            </thead>

                                            <tbody>

                                                {rentalRequests.length > 0 ? (

                                                    rentalRequests.map((r, index) => (

                                                        <tr key={r.id}>

                                                            <td>{index + 1}</td>

                                                            <td>
                                                                <div className="fw-semibold">
                                                                    {r.customer_name}
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: "12px" }}>
                                                                    {r.customer_mobile}
                                                                </div>
                                                            </td>

                                                            <td>{r.device_name}</td>

                                                            <td>{r.rent_type}</td>

                                                            <td>{r.duration}</td>

                                                            <td>₹ {r.total_amount}</td>

                                                            <td>

                                                                <Select
                                                                    options={getAllowedStatus(r.request_status)}
                                                                    styles={selectStyles}
                                                                    value={orderStatus.find(s => s.value === r.request_status)}
                                                                    isDisabled={[4, 5].includes(r.request_status)}
                                                                    onChange={(e) => {

                                                                        if (e.value === 4) {

                                                                            setCancelRequestId(r.rental_request_id);
                                                                            setCancelModal(true);

                                                                        } else {

                                                                            dispatch(
                                                                                updateRentalRequestStatus({
                                                                                    rental_request_id: r.rental_request_id,
                                                                                    request_status: e.value
                                                                                })
                                                                            );

                                                                        }

                                                                    }}
                                                                />

                                                            </td>

                                                            <td className="text-center">

                                                                <ul className="list-inline hstack gap-2 mb-0 justify-content-center">

                                                                    <li className="list-inline-item">

                                                                        <button
                                                                            className="text-primary border-0 bg-transparent"
                                                                            onClick={() => {
                                                                                setViewData(r);
                                                                                setViewModal(true);
                                                                            }}
                                                                        >
                                                                            <i className="ri-eye-fill fs-16" />
                                                                        </button>

                                                                    </li>

                                                                    <li className="list-inline-item">

                                                                        <button
                                                                            className="text-danger border-0 bg-transparent"
                                                                            onClick={() => onClickDelete(r)}
                                                                        >
                                                                            <i className="ri-delete-bin-5-fill fs-16"></i>
                                                                        </button>

                                                                    </li>

                                                                </ul>

                                                            </td>

                                                        </tr>

                                                    ))

                                                ) : (

                                                    <tr>
                                                        <td colSpan="8" className="text-center py-5">
                                                            No Rental Requests Found
                                                        </td>
                                                    </tr>

                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </InfiniteScroll>

                            </CardBody>

                        </Card>

                    </Col>
                </Row>

            </Container>

            {viewModal &&
                <RentalRequestViewModal
                    isOpen={viewModal}
                    toggle={() => setViewModal(false)}
                    data={viewData}
                />
            }

            <Modal isOpen={cancelModal} toggle={() => setCancelModal(false)}>

                <ModalHeader toggle={() => setCancelModal(false)}>
                    Cancel Rental Request
                </ModalHeader>

                <ModalBody>

                    <label className="form-label">Cancel Reason</label>

                    <textarea
                        className="form-control"
                        rows="3"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Enter cancel reason"
                    />

                </ModalBody>

                <ModalFooter>

                    <Button color="secondary" onClick={() => setCancelModal(false)}>
                        Close
                    </Button>

                    <Button color="danger" onClick={handleCancelSubmit}>
                        Cancel Request
                    </Button>

                </ModalFooter>

            </Modal>

            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />

        </div>

    );

};

export default RentalRequestList;