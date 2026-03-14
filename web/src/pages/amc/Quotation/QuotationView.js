import React from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    Card,
    CardBody,
    Badge,
    Table,
} from "reactstrap";
import { formatDateTime } from "../../../helpers/date_and_time_format";

const InfoItem = ({ label, value }) => (
    <div className="mb-3">
        <div
            className="text-uppercase text-muted fw-semibold mb-1"
            style={{ fontSize: "11px", letterSpacing: "0.5px" }}
        >
            {label}
        </div>
        <div className="fw-semibold text-dark" style={{ fontSize: "14px" }}>
            {value || "-"}
        </div>
    </div>
);

const SummaryBox = ({ label, value, valueClass = "" }) => (
    <div
        className="d-flex justify-content-between align-items-center py-2 border-bottom"
        style={{ fontSize: "14px" }}
    >
        <span className="text-muted fw-semibold">{label}</span>
        <span className={`fw-bold ${valueClass}`}>{value}</span>
    </div>
);

const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "sent" || s === "pending") return "warning";
    if (s === "approved" || s === "accept") return "success";
    if (s === "rejected") return "danger";
    return "secondary";
};

const QuotationView = ({
    isOpen,
    toggle,
    quotationData,
    childQuotationItems = [],
}) => {
    if (!quotationData) return null;

    const statusColor = getStatusBadgeClass(quotationData.quotation_status);

    const subTotal = Number(quotationData.sub_total || 0);
    const gstAmount = Number(quotationData.gst_amount || 0);
    const discountAmount = Number(quotationData.discount_amount || 0);
    const totalAmount = Number(quotationData.total_amount || 0);

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
            <ModalHeader toggle={toggle} className="border-0 pb-0">
                <div>
                    <h4 className="mb-1 fw-bold">Quotation Details</h4>
                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        Complete quotation information with customer, vendor, items and pricing
                    </p>
                </div>
            </ModalHeader>

            <ModalBody className="pt-3" style={{ background: "#f8f9fa" }}>
                {/* Top Summary */}
                <Card className="border-0 shadow-sm mb-4">
                    <CardBody className="p-4">
                        <Row className="align-items-center gy-3">
                            <Col md={8}>
                                <div className="d-flex flex-column gap-2">
                                    <div>
                                        <div className="text-muted" style={{ fontSize: "12px" }}>
                                            Quotation Number
                                        </div>
                                        <h4 className="mb-0 fw-bold text-dark">
                                            {quotationData.quotation_number || "-"}
                                        </h4>
                                    </div>

                                    <div className="d-flex flex-wrap gap-3 mt-2">
                                        <div>
                                            <span className="text-muted me-2">Created:</span>
                                            <span className="fw-semibold">
                                                {formatDateTime(quotationData.createdAt)}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-muted me-2">Status:</span>
                                            <Badge color={statusColor} pill className="px-3 py-2">
                                                {quotationData.quotation_status || "-"}
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
                                        Final Amount
                                    </div>
                                    <h2 className="mb-0 fw-bold text-success">
                                        ₹ {totalAmount.toFixed(2)}
                                    </h2>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Row>
                    {/* Customer */}
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

                                <InfoItem label="Customer Name" value={quotationData.customer_name} />
                                <InfoItem label="Email" value={quotationData.customer_email} />
                                <InfoItem label="Phone" value={quotationData.customer_phone} />
                                <InfoItem
                                    label="GST Number"
                                    value={quotationData.customer_gst_no || quotationData.customer_gstin}
                                />
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Vendor */}
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

                                <InfoItem label="Vendor Name" value={quotationData.vendor_name} />
                                <InfoItem label="Email" value={quotationData.vendor_email} />
                                <InfoItem label="Phone" value={quotationData.vendor_phone} />
                                <InfoItem
                                    label="GST Number"
                                    value={quotationData.vendor_gst_no || quotationData.vendor_gstin}
                                />
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Address */}
                    <Col lg={8} className="mb-4">
                        <Card className="border-0 shadow-sm h-100">
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
                                        <i className="ri-map-pin-line fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Address Details</h5>
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <InfoItem
                                            label="Address"
                                            value={quotationData.customer_address_description}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <InfoItem
                                            label="Mobile"
                                            value={quotationData.customer_address_mobile}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InfoItem
                                            label="City"
                                            value={quotationData.customer_address_city}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InfoItem
                                            label="Taluka"
                                            value={quotationData.customer_address_taluka}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InfoItem
                                            label="District"
                                            value={quotationData.customer_address_district}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <InfoItem
                                            label="State"
                                            value={quotationData.customer_address_state}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <InfoItem
                                            label="Pincode"
                                            value={quotationData.customer_address_pincode}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Amount Summary */}
                    <Col lg={4} className="mb-4">
                        <Card className="border-0 shadow-sm h-100">
                            <CardBody className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                            width: "38px",
                                            height: "38px",
                                            background: "#f3e8ff",
                                            color: "#6f42c1",
                                        }}
                                    >
                                        <i className="ri-money-rupee-circle-line fs-5"></i>
                                    </div>
                                    <h5 className="mb-0 fw-bold">Amount Summary</h5>
                                </div>

                                <SummaryBox label="Sub Total" value={`₹ ${subTotal.toFixed(2)}`} />
                                <SummaryBox label="GST Amount" value={`₹ ${gstAmount.toFixed(2)}`} />
                                <SummaryBox label="Discount" value={`₹ ${discountAmount.toFixed(2)}`} />
                                <SummaryBox
                                    label="Final Total"
                                    value={`₹ ${totalAmount.toFixed(2)}`}
                                    valueClass="text-success"
                                />

                                <div className="mt-3 pt-2">
                                    <div
                                        className="text-uppercase text-muted fw-semibold mb-1"
                                        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                                    >
                                        Remark
                                    </div>
                                    <div className="fw-semibold text-dark">
                                        {quotationData.quotation_remark || quotationData.remark || "-"}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Items */}
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 className="mb-0 fw-bold">Quotation Items</h5>
                                    <span className="text-muted" style={{ fontSize: "13px" }}>
                                        Total Items: {childQuotationItems?.length || 0}
                                    </span>
                                </div>

                                <div className="table-responsive">
                                    <Table className="align-middle mb-0">
                                        <thead style={{ background: "#f1f3f5" }}>
                                            <tr>
                                                <th className="border-0">#</th>
                                                <th className="border-0">Item Name</th>
                                                <th className="border-0">Description</th>
                                                <th className="border-0 text-center">Qty</th>
                                                <th className="border-0 text-end">Rate</th>
                                                <th className="border-0 text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {childQuotationItems?.length > 0 ? (
                                                childQuotationItems.map((item, index) => (
                                                    <tr key={item.quotation_item_id || index}>
                                                        <td>{index + 1}</td>
                                                        <td className="fw-semibold">
                                                            {item.product_name || item.product_name || "-"}
                                                        </td>
                                                        <td className="text-muted">
                                                            {item.problem_note ||
                                                                item.problem_note ||
                                                                "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {item.qty || item.quantity || "-"}
                                                        </td>
                                                        <td className="text-end">
                                                            ₹ {item.rate || item.price || 0}
                                                        </td>
                                                        <td className="text-end fw-bold">
                                                            ₹ {item.total || item.item_total || 0}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-muted">
                                                        No quotation items found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    );
};

export default QuotationView;