import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Label,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import InfiniteScroll from "react-infinite-scroll-component";

import { useDispatch, useSelector } from "react-redux";
import { getRequestsList, deleteRequest } from "../../store/Requests";
import ReqToSupplierAdd from "./ReqToSupplierAdd";
import ReqToSupplierUpdate from "./ReqToSupplierUpdate";
import DeleteModal from "../../Components/Common/DeleteModal";
import { getSuppliersList } from "../../store/Supplier";
import AuthUser from "../../helpers/AuthType/AuthUser";
import { formatDateTime } from "../../helpers/date_and_time_format";

const ReqToSupplierList = () => {
    document.title = "Supplier Requests";

    const dispatch = useDispatch();
    const { requests, loading, addRequestResponse } = useSelector((state) => state.RequestsReducer);

    const { user, permissions } = AuthUser();

    // ✅ filters
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
    });

    // ✅ pagination (infinite scroll needs page)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });

    // ✅ flags
    const hasListPermission = permissions?.some(
        (p) =>
            p.permission_category === "REQ_TO_SUPPLIER" &&
            Number(p.permission_path) === 1
    );

    const hasCreatePermission = permissions?.some(
        (p) =>
            p.permission_category === "REQ_TO_SUPPLIER" &&
            Number(p.permission_path) === 2 &&
            user.user_type != 7
    );

    const hasUpdatePermission = permissions?.some(
        (p) =>
            p.permission_category === "REQ_TO_SUPPLIER" &&
            Number(p.permission_path) === 3
    );

    const hasDeletePermission = permissions?.some(
        (p) =>
            p.permission_category === "REQ_TO_SUPPLIER" &&
            Number(p.permission_path) === 4
    );

    // ✅ states
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isRequestData, setIsRequestData] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // ✅ Infinite data store
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    // ✅ initial fetch only when list permission
    useEffect(() => {
        if (addRequestResponse) {
            dispatch(
                getRequestsList({
                    ...filters,
                    page: 1,
                    limit: pagination.limit,
                })
            );

        }
        if (hasListPermission) {
            dispatch(getSuppliersList());

            // start from page 1
            setPagination((p) => ({ ...p, page: 1 }));
            setItems([]);
            setHasMore(true);

            dispatch(
                getRequestsList({
                    ...filters,
                    page: 1,
                    limit: pagination.limit,
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, hasListPermission, addRequestResponse]);

    // ✅ when redux requests update -> append to items
    useEffect(() => {
        if (!loading) {
            const newData = requests || [];

            if (pagination.page === 1) {
                setItems(newData);
            } else {
                setItems((prev) => [...prev, ...newData]);
            }

            // ✅ stop infinite when returned less than limit
            if (newData.length < pagination.limit) {
                setHasMore(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requests, loading]);

    // ✅ Keyboard shortcut: Alt + A open add, Alt + C close add
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.altKey && event.key.toLowerCase() === "a") {
                event.preventDefault();
                if (hasCreatePermission) setIsOpen(true);
            }
            if (event.altKey && event.key.toLowerCase() === "c") {
                event.preventDefault();
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hasCreatePermission]);

    // ✅ edit
    const onClickEdit = (req) => {
        setIsRequestData(req);
        setIsUpdateOpen(true);
    };

    // ✅ delete
    const onClickDelete = (req) => {
        setSelectedRequest(req);
        setDeleteModal(true);
    };

    const handleDeleteRequest = () => {
        if (selectedRequest) {
            dispatch(deleteRequest(selectedRequest.requests_id));
        }
        setDeleteModal(false);
        setSelectedRequest(null);
    };

    // =========================
    // ✅ FILTER + REFRESH
    // =========================
    const applyFilter = () => {
        setPagination((p) => ({ ...p, page: 1 }));
        setItems([]);
        setHasMore(true);

        dispatch(
            getRequestsList({
                ...filters,
                page: 1,
                limit: pagination.limit,
            })
        );
    };

    const refresh = () => {
        setPagination((p) => ({ ...p, page: 1 }));
        setItems([]);
        setHasMore(true);

        dispatch(
            getRequestsList({
                ...filters,
                page: 1,
                limit: pagination.limit,
            })
        );
    };

    // =========================
    // ✅ INFINITE SCROLL FETCH
    // =========================
    const fetchMoreData = () => {
        const nextPage = pagination.page + 1;

        setPagination((p) => ({ ...p, page: nextPage }));

        dispatch(
            getRequestsList({
                ...filters,
                page: nextPage,
                limit: pagination.limit,
            })
        );
    };

    return (
        <div className="page-content">
            <Container fluid>
                {!hasListPermission ? (
                    <Row>
                        <Col lg={12}>
                            <Card className="shadow-sm">
                                <CardBody className="text-center py-5">
                                    <h5 className="mb-2">
                                        You don't have permission to view this page
                                    </h5>
                                    <p className="text-muted mb-0">
                                        Category: <b>REQ_TO_SUPPLIER</b> (List)
                                    </p>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header border-0">
                                    <Row className="align-items-center gy-3">
                                        <Col md="3">
                                            <h5 className="mb-0 fw-bold">Supplier Requests</h5>
                                        </Col>

                                        {/* ✅ FILTER HEADER */}
                                        <Col md="9" className="ms-auto">
                                            <Row className="align-items-end g-2 justify-content-end">
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
                                                                    : "",
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
                                                                    : "",
                                                            }))
                                                        }
                                                    />
                                                </Col>

                                                {/* Buttons */}
                                                <Col md="4" className="d-flex gap-2 justify-content-end">
                                                    <Button
                                                        color="success"
                                                        className="mt-auto"
                                                        onClick={applyFilter}
                                                    >
                                                        Apply
                                                    </Button>

                                                    <Button
                                                        color="primary"
                                                        className="mt-auto"
                                                        onClick={refresh}
                                                    >
                                                        Refresh
                                                    </Button>

                                                    {hasCreatePermission && (
                                                        <Button
                                                            color="success"
                                                            className="mt-auto"
                                                            onClick={() => setIsOpen(true)}
                                                        >
                                                            + Create
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </CardHeader>

                                <CardBody className="pt-0">
                                    {/* ✅ Scroll container for infinite */}
                                    <div
                                        id="scrollableDiv"
                                        style={{ height: "65vh", overflow: "auto" }}
                                    >
                                        <InfiniteScroll
                                            dataLength={items.length}
                                            next={fetchMoreData}
                                            hasMore={hasMore}
                                            loader={
                                                <div className="text-center py-3">Loading more...</div>
                                            }
                                            endMessage={
                                                <div className="text-center py-3 text-muted">
                                                    No more requests
                                                </div>
                                            }
                                            scrollableTarget="scrollableDiv"
                                        >
                                            <div className="table-responsive">
                                                <table className="table align-middle table-hover mb-0">
                                                    <thead className="table-light text-uppercase text-muted sticky-top">
                                                        <tr>
                                                            <th style={{ width: "5%" }}>#</th>
                                                            <th style={{ width: "10%" }}>Request ID</th>
                                                            <th style={{ width: "15%" }}>{user.user_type == 7 ? "Vendor" : "Supplier"}</th>
                                                            <th style={{ width: "25%" }}>Date</th> 
                                                            {user.user_type == 1 && <th style={{ width: "25%" }}>Vendor </th>}
                                                            <th style={{ width: "25%" }}>Message</th>
                                                            <th style={{ width: "25%" }}>Reply</th>
                                                            <th style={{ width: "10%" }}>Status</th>
                                                            <th style={{ width: "10%" }} className="text-end">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {(items || []).length > 0 ? (
                                                            items.map((req, index) => (
                                                                <tr key={req?.requests_id || index}>
                                                                    <td>{index + 1}</td>

                                                                    <td>
                                                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                                                            R-{req?.requests_id}
                                                                        </span>
                                                                    </td>

                                                                    <td title={req?.supplier_name || ""}>
                                                                        <div className="fw-bold">
                                                                            {user.user_type == 7 ? req?.business_name : req?.supplier_name}
                                                                        </div>
                                                                    </td>
                                                                    <td  >
                                                                        {formatDateTime(req?.createdAt)}
                                                                    </td>

                                                                    {user.user_type == 1 && <td title={req?.business_name || ""}>
                                                                        <div className="fw-bold">
                                                                            {req?.business_name}
                                                                        </div>
                                                                    </td>

                                                                    }                                                                    <td>
                                                                        <div
                                                                            className="text-muted"
                                                                            title={req?.request_message || ""}
                                                                        >
                                                                            {req?.request_message
                                                                                ? req.request_message.slice(0, 40) +
                                                                                (req.request_message.length > 40
                                                                                    ? "..."
                                                                                    : "")
                                                                                : "-"}
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div
                                                                            className="text-muted"
                                                                            title={req?.request_reply || ""}
                                                                        >
                                                                            {req?.request_reply
                                                                                ? req.request_reply.slice(0, 40) +
                                                                                (req.request_reply.length > 40
                                                                                    ? "..."
                                                                                    : "")
                                                                                : "-"}
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        {req?.request_status == 1 ? (
                                                                            <span className="badge bg-success-subtle text-success">
                                                                                Seen
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-danger-subtle text-danger">
                                                                                Unseen
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    <td className="text-end">
                                                                        <ul className="list-inline hstack gap-2 mb-0 justify-content-end">
                                                                            {hasUpdatePermission &&
                                                                                (req?.request_status == 0 || Number(user?.user_type) === 7) && (
                                                                                    <li className="list-inline-item">
                                                                                        <button
                                                                                            className="text-primary border-0 bg-transparent"
                                                                                            onClick={() => onClickEdit(req)}
                                                                                            title="Edit"
                                                                                        >
                                                                                            <i className="ri-pencil-fill fs-16"></i>
                                                                                        </button>
                                                                                    </li>
                                                                                )}


                                                                            {hasDeletePermission && user.user_type != 7 && (
                                                                                <li className="list-inline-item">
                                                                                    <button
                                                                                        className="text-danger border-0 bg-transparent"
                                                                                        onClick={() => onClickDelete(req)}
                                                                                        title="Delete"
                                                                                    >
                                                                                        <i className="ri-delete-bin-5-fill fs-16"></i>
                                                                                    </button>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            !loading && (
                                                                <tr>
                                                                    <td colSpan="7" className="text-center py-5">
                                                                        <lord-icon
                                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                                            trigger="loop"
                                                                            colors="primary:#405189,secondary:#0ab39c"
                                                                            style={{ width: "72px", height: "72px" }}
                                                                        ></lord-icon>
                                                                        <div className="mt-4">
                                                                            <h5>No requests found</h5>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </InfiniteScroll>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>

            {/* ✅ Add Modal */}
            {hasCreatePermission && isOpen && (
                <ReqToSupplierAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />
            )}

            {/* ✅ Update Modal */}
            {hasUpdatePermission && isUpdateOpen && (
                <ReqToSupplierUpdate
                    isOpen={isUpdateOpen}
                    toggle={() => setIsUpdateOpen(false)}
                    requestData={isRequestData}
                />
            )}

            {/* ✅ Delete Modal */}
            {hasDeletePermission && (
                <DeleteModal
                    show={deleteModal}
                    onDeleteClick={handleDeleteRequest}
                    onCloseClick={() => setDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default ReqToSupplierList;
