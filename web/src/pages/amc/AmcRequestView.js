import React, { useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Badge,
    Card,
    CardBody,
    Table,
    Spinner,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../../helpers/date_and_time_format";
import { getChildAmcRequest } from "../../store/amc/AmcRequest";

const InfoItem = ({ label, value }) => (
    <div className="mb-3">
        <div
            className="text-uppercase text-muted fw-semibold mb-1"
            style={{ fontSize: "11px", letterSpacing: "0.5px" }}
        >
            {label}
        </div>
        <div className="fw-semibold text-dark" style={{ fontSize: "14px" }}>
            {value !== null && value !== undefined && value !== "" ? value : "-"}
        </div>
    </div>
);

const getStatusColor = (status) => {
    if (!status) return "secondary";

    const s = String(status).toLowerCase();

    if (s === "pending") return "warning";
    if (s === "approved" || s === "success" || s === "completed")
        return "success";
    if (s === "rejected" || s === "cancelled") return "danger";
    if (s === "inprogress" || s === "in progress") return "info";

    return "secondary";
};

const AmcRequestView = ({ isOpen, toggle, requestData }) => {
    const dispatch = useDispatch();

    const { childRequests, loading } = useSelector(
        (state) => state.AmcRequestReducer
    );

    useEffect(() => {
        if (isOpen && requestData?.request_id) {
            dispatch(getChildAmcRequest(requestData.request_id));
        }
    }, [dispatch, isOpen, requestData]);

    if (!requestData) return null;

    const childData = Array.isArray(childRequests) ? childRequests : [];
    const statusColor = getStatusColor(requestData?.request_status);

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
            <ModalHeader toggle={toggle} className="border-0 pb-0">
                <div>
                    <h4 className="mb-1 fw-bold">AMC Request Details</h4>
                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        Complete request details with customer, vendor and request items
                    </p>
                </div>
            </ModalHeader>

            <ModalBody className="pt-3" style={{ background: "#f8f9fa" }}>
                {/* Top Summary */}
                <Card className="border card-border-success p-3 shadow-lg">

                    <Card className="border-0 shadow-sm mb-4">
                        <CardBody className="p-4">
                            <Row className="align-items-center gy-3">
                                <Col md={8}>
                                    <div className="d-flex flex-column gap-2">
                                        <div>
                                            <div className="text-muted" style={{ fontSize: "12px" }}>
                                                Request Number
                                            </div>
                                            <h4 className="mb-0 fw-bold text-dark">
                                                #{requestData.request_id || "-"}
                                            </h4>
                                        </div>

                                        <div className="d-flex flex-wrap gap-3 mt-2">
                                            <div>
                                                <span className="text-muted me-2">Created:</span>
                                                <span className="fw-semibold">
                                                    {requestData.createdAt
                                                        ? formatDateTime(requestData.createdAt)
                                                        : "-"}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-muted me-2">Status:</span>
                                                <Badge color={statusColor} pill className="px-3 py-2">
                                                    {requestData.request_status || "-"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div
                                        className="rounded-3 p-3 text-end"
                                        style={{
                                            background: "linear-gradient(135deg, #ffffff, #f1f3f5)",
                                            border: "1px solid #e9ecef",
                                        }}
                                    >
                                        <div className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                            Total Items
                                        </div>
                                        <h2 className="mb-0 fw-bold text-primary">
                                            {childData.length}
                                        </h2>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Row>
                        {/* Customer Details */}
                        <Col lg={6} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <CardBody className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{
                                                width: "38px",
                                                height: "38px",
                                                background: "#e7f1ff",
                                                color: "#0d6efd",
                                            }}
                                        >
                                            <i className="ri-user-3-line fs-5"></i>
                                        </div>
                                        <h5 className="mb-0 fw-bold">Customer Details</h5>
                                    </div>

                                    <InfoItem label="Customer Name" value={requestData.customer_name} />
                                    <InfoItem label="Customer Email" value={requestData.customer_email} />
                                    <InfoItem label="Customer Phone" value={requestData.customer_phone} />
                                    <InfoItem label="Customer ID" value={requestData.customer_id} />
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Vendor Details */}
                        <Col lg={6} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <CardBody className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{
                                                width: "38px",
                                                height: "38px",
                                                background: "#eafaf1",
                                                color: "#198754",
                                            }}
                                        >
                                            <i className="ri-building-line fs-5"></i>
                                        </div>
                                        <h5 className="mb-0 fw-bold">Vendor Details</h5>
                                    </div>

                                    <InfoItem label="Vendor Name" value={requestData.vendor_name} />
                                    <InfoItem label="Vendor Email" value={requestData.vendor_email} />
                                    <InfoItem label="Vendor Phone" value={requestData.vendor_phone} />
                                    <InfoItem label="Vendor ID" value={requestData.vendor_id} />
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Request Info */}
                        <Col lg={12} className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <CardBody className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{
                                                width: "38px",
                                                height: "38px",
                                                background: "#fff3e6",
                                                color: "#fd7e14",
                                            }}
                                        >
                                            <i className="ri-file-list-3-line fs-5"></i>
                                        </div>
                                        <h5 className="mb-0 fw-bold">Request Information</h5>
                                    </div>

                                    <Row>
                                        <Col md={4}>
                                            <InfoItem
                                                label="Request ID"
                                                value={requestData.request_id}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <InfoItem
                                                label="Status"
                                                value={requestData.request_status}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <InfoItem
                                                label="Created At"
                                                value={
                                                    requestData.createdAt
                                                        ? formatDateTime(requestData.createdAt)
                                                        : "-"
                                                }
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <InfoItem
                                                label="Updated At"
                                                value={
                                                    requestData.updatedAt
                                                        ? formatDateTime(requestData.updatedAt)
                                                        : "-"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Child Items */}
                        <Col lg={12}>
                            <Card className="border-0 shadow-sm">
                                <CardBody className="p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h5 className="mb-0 fw-bold">Request Items</h5>
                                        <span className="text-muted" style={{ fontSize: "13px" }}>
                                            Total Items: {childData.length}
                                        </span>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner color="primary" />
                                            <div className="mt-2 text-muted">
                                                Loading request items...
                                            </div>
                                        </div>
                                    ) : childData.length > 0 ? (
                                        <div className="table-responsive">
                                            <Table className="align-middle mb-0">
                                                <thead style={{ background: "#f1f3f5" }}>
                                                    <tr>
                                                        <th className="border-0">#</th>
                                                        <th className="border-0">Product Name</th>
                                                        <th className="border-0 text-center">Qty</th>
                                                        <th className="border-0">Problem Note</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {childData.map((item, index) => (
                                                        <tr key={item.amc_request_child_id || index}>
                                                            <td>{index + 1}</td>
                                                            <td className="fw-semibold">
                                                                {item.child_name ||
                                                                    item.title ||
                                                                    item.product_name ||
                                                                    "-"}
                                                            </td>
                                                            <td className="text-center">
                                                                {item.qty || item.quantity || "-"}
                                                            </td>
                                                            <td className="text-muted">
                                                                {item.problem_note || "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            No child request data found
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Card>

            </ModalBody>

            <ModalFooter className="border-0 pt-0">
                <Button color="danger" onClick={toggle} className="px-4">
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AmcRequestView;