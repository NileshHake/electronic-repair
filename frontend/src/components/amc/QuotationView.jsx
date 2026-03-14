import { formatDateTime } from "../../helpers/date_and_time";
import { useGetAmcQuotationDetailsQuery, useUpdateAmcQuotationStatusMutation } from "@/redux/features/amcRequestApi";
import React, { useState } from "react";
import Select from "react-select";
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
    Spinner,
} from "reactstrap";

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
    if (s === "rejected" || s === "reject") return "danger";

    return "secondary";
};

const QuotationView = ({ isOpen, toggle, quotationId }) => {

    const [selectedStatus, setSelectedStatus] = useState(null);

    const [updateQuotationStatus] = useUpdateAmcQuotationStatusMutation();

    const { data, isLoading } = useGetAmcQuotationDetailsQuery(quotationId, {
        skip: !quotationId,
    });

    const quotation = data?.quotation || {};
    const customer = data?.customer || {};
    const vendor = data?.vendor || {};
    const address = data?.address || {};
    const items = data?.items || [];

    const statusColor = getStatusBadgeClass(quotation.quotation_status);

    const subTotal = Number(quotation.base_amount || 0);
    const gstAmount = Number(quotation.gst_amount || 0);
    const totalAmount = Number(quotation.total_amount || 0);

    const options = [
        { value: "Approved", label: "Approved" },
        { value: "Reject", label: "Reject" }
    ];

    const handleStatusChange = async (selectedOption) => {

        setSelectedStatus(selectedOption);

        try {

            const response = await updateQuotationStatus({
                quotation_id: quotationId,
                quotation_status: selectedOption.value
            });

            if (response) {
                toggle();
            }

        } catch (error) {
            console.log(error);
        }

    };

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalBody className="text-center p-5">
                    <Spinner color="primary" />
                </ModalBody>
            </Modal>
        );
    }

    const isRejected =
        quotation.quotation_status?.toLowerCase() === "reject" ||
        quotation.quotation_status?.toLowerCase() === "rejected";

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
            <ModalHeader toggle={toggle} className="border-0 pb-0">
                <div>
                    <h4 className="mb-1 fw-bold">Quotation Details</h4>
                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        Complete quotation information
                    </p>
                </div>
            </ModalHeader>

            <ModalBody className="pt-3" style={{ background: "#f8f9fa" }}>
                {/* Top Summary */}
                <Card className="border-0 shadow-sm mb-4">
                    <CardBody className="p-4">
                        <Row className="align-items-center gy-3">
                            <Col md={8}>
                                <div>
                                    <div className="text-muted" style={{ fontSize: "12px" }}>
                                        Quotation Number
                                    </div>
                                    <h4 className="mb-2 fw-bold">
                                        {quotation.quotation_number || "-"}
                                    </h4>

                                    <div className="d-flex gap-3 flex-wrap">
                                        <div>
                                            <span className="text-muted me-2">Created:</span>
                                            <span className="fw-semibold">
                                                {formatDateTime(quotation.createdAt)}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-muted me-2">Status:</span>
                                            <Badge color={statusColor} pill>
                                                {quotation.quotation_status || "-"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col md={4}>
                                <div
                                    className="rounded p-3 text-end"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #eee",
                                    }}
                                >
                                    <div className="text-muted">Final Amount</div>
                                    <h2 className="text-success fw-bold">
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
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <h5 className="fw-bold mb-3">Customer Details</h5>

                                <InfoItem label="Customer Name" value={customer.name} />
                                <InfoItem label="Email" value={customer.email} />
                                <InfoItem label="Phone" value={customer.phone} />
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Vendor */}
                    <Col lg={6} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <h5 className="fw-bold mb-3">Vendor Details</h5>

                                <InfoItem label="Vendor Name" value={vendor.name} />
                                <InfoItem label="Email" value={vendor.email} />
                                <InfoItem label="Phone" value={vendor.phone} />
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Address */}
                    <Col lg={8} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <h5 className="fw-bold mb-3">Address Details</h5>

                                <Row>
                                    <Col md={6}>
                                        <InfoItem label="Address" value={address.description} />
                                    </Col>

                                    <Col md={6}>
                                        <InfoItem label="Mobile" value={address.mobile} />
                                    </Col>

                                    <Col md={4}>
                                        <InfoItem label="City" value={address.city} />
                                    </Col>

                                    <Col md={4}>
                                        <InfoItem label="Taluka" value={address.taluka} />
                                    </Col>

                                    <Col md={4}>
                                        <InfoItem label="District" value={address.district} />
                                    </Col>

                                    <Col md={6}>
                                        <InfoItem label="State" value={address.state} />
                                    </Col>

                                    <Col md={6}>
                                        <InfoItem label="Pincode" value={address.pincode} />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Amount Summary */}
                    <Col lg={4} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <h5 className="fw-bold mb-3">Amount Summary</h5>

                                <SummaryBox label="Sub Total" value={`₹ ${subTotal.toFixed(2)}`} />
                                <SummaryBox label="GST Amount" value={`₹ ${gstAmount.toFixed(2)}`} />
                                <SummaryBox
                                    label="Final Total"
                                    value={`₹ ${totalAmount.toFixed(2)}`}
                                    valueClass="text-success"
                                />

                                {quotation.quotation_status === "Reject" || quotation.quotation_status === "Rejected" ? (
                                    <div className="mt-2 text-danger fw-semibold">
                                        Customer has rejected this quotation
                                    </div>
                                ) : (
                                    <Select
                                        options={options}
                                        value={selectedStatus}
                                        placeholder="Select Status"
                                        onChange={handleStatusChange}
                                        isDisabled={isRejected}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Items */}
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <h5 className="fw-bold">Quotation Items</h5>
                                    <span className="text-muted">
                                        Total Items: {items.length}
                                    </span>
                                </div>

                                <div className="table-responsive">
                                    <Table className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Item Name</th>
                                                <th>Description</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Rate</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {items.length > 0 ? (
                                                items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>

                                                        <td className="fw-semibold">
                                                            {item.product_name}
                                                        </td>

                                                        <td>{item.problem_note || "-"}</td>

                                                        <td className="text-center">
                                                            {item.qty || "-"}
                                                        </td>

                                                        <td className="text-end">
                                                            ₹ {item.price || 0}
                                                        </td>

                                                        <td className="text-end fw-bold">
                                                            ₹ {item.total || 0}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
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