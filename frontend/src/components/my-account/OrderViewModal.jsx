import React, { useMemo, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Card,
    Badge,
} from "reactstrap";

import { api } from "config";
import { formatDateTime } from "@/helpers/date_and_time";
import { useGetOrderChildListQuery } from "@/redux/features/orderApi"; 
import InvoicePreviewModal from "./InvoicePreviewModal";
const getStatusMeta = (s) => {
    const n = Number(s);
    if (n === 1) return { text: "Approved", color: "success" };
    if (n === 2) return { text: "Packing", color: "info" };
    if (n === 3) return { text: "Dispatch", color: "primary" };
    if (n === 4) return { text: "Delivered", color: "warning" };
    if (n === 5) return { text: "Rejected", color: "danger" };
    return { text: "Pending", color: "secondary" };
};

const safeFirstImage = (product_image) => {
    try {
        if (!product_image) return "";
        const parsed =
            typeof product_image === "string" ? JSON.parse(product_image) : product_image;
        return Array.isArray(parsed) && parsed[0] ? parsed[0] : "";
    } catch (e) {
        return "";
    }
};

const OrderViewModal = ({ isOpen, toggle, order }) => {
    if (!order) return null;

    const orderId = order?.order_master_id;

    // ✅ QUERY proper usage (auto fetch + skip support)
    const { data, isLoading, isError, refetch } = useGetOrderChildListQuery(
        { order_id: orderId },
        { skip: !isOpen || !orderId }
    );

    // ✅ invoice modal state
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    const openInvoice = () => setIsInvoiceOpen(true);
    const closeInvoice = () => setIsInvoiceOpen(false);

    const orderItems = data?.rows || data?.orderItems || data?.data || data || [];

    const meta = useMemo(
        () => getStatusMeta(order?.order_master_status),
        [order?.order_master_status]
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered backdrop="static">
            <ModalHeader toggle={toggle} className="bg-light p-3">
                Order Details #{orderId}
            </ModalHeader>

            <ModalBody>
                {/* ================= MASTER INFO ================= */}
                <Card className="shadow-lg border-0 p-4 mb-4 rounded-3">
                    <Row className="mb-3 g-2">
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-user-line me-2 text-primary fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">Name</small>
                                    <span className="fw-semibold text-dark">
                                        {order.order_master_customer_name || order.user_name || "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-phone-line me-2 text-success fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">Phone</small>
                                    <span className="fw-semibold text-dark">
                                        {order.order_master_delivery_phone_number || "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-3 g-2">
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-map-pin-line me-2 text-warning fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">City / Address</small>
                                    <span className="fw-semibold text-dark">
                                        {order.customer_address_description || "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-hashtag-line me-2 text-info fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">Pincode</small>
                                    <span className="fw-semibold text-dark">
                                        {order.customer_address_pincode || "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-3 g-2">
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-calendar-line me-2 text-secondary fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">Order Date</small>
                                    <span className="fw-semibold text-dark">
                                        {order.order_master_date ? formatDateTime(order.order_master_date) : "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className="p-2 bg-light rounded d-flex align-items-center">
                                <i className="ri-calendar-check-line me-2 text-success fs-5"></i>
                                <div>
                                    <small className="text-muted d-block">Delivered Date</small>
                                    <span className="fw-semibold text-dark">
                                        {order.order_master_delivered_date
                                            ? formatDateTime(order.order_master_delivered_date)
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-3 g-2">
                        <Col xs={12} md={4}>
                            <div className="p-2 bg-success-subtle rounded d-flex align-items-center justify-content-between">
                                <strong>Sub Total:</strong>
                                <span className="fw-bold text-success">
                                    ₹ {Number(order.order_master_sub_total || 0).toFixed(2)}
                                </span>
                            </div>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className="p-2 bg-info-subtle rounded d-flex align-items-center justify-content-between">
                                <strong>GST ({order.order_master_gst_percentage || 0}%):</strong>
                                <span className="fw-bold text-info">
                                    ₹ {Number(order.order_master_gst_amount || 0).toFixed(2)}
                                </span>
                            </div>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className="p-2 bg-warning-subtle rounded d-flex align-items-center justify-content-between">
                                <strong>Delivery:</strong>
                                <span className="fw-bold text-warning">
                                    ₹ {Number(order.order_master_delivery_charge || 0).toFixed(2)}
                                </span>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-2">
                        <Col xs={12} md={6}>
                            <div className="p-2 rounded d-flex align-items-center justify-content-between bg-primary-subtle">
                                <strong>Total:</strong>
                                <span className="fw-bold text-primary fs-5">
                                    ₹ {Number(order.order_master_grand_total || 0).toFixed(2)}
                                </span>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className="p-2 rounded d-flex align-items-center justify-content-between bg-secondary-subtle">
                                <strong>Status:</strong>
                                <Badge color={meta.color} className="fs-6" pill>
                                    {meta.text}
                                </Badge>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* ================= ORDER ITEMS ================= */}
                <div className="table-responsive" style={{ maxHeight: 360, overflowY: "auto" }}>
                    <table className="table align-middle table-hover mb-0">
                        <thead className="table-light text-uppercase text-muted sticky-top" style={{ top: 0, zIndex: 1 }}>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Image</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Per (%)</th>
                                <th>GST</th>
                                <th>Discount</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-3">
                                        Loading items...
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-3 text-danger">
                                        Failed to load items
                                    </td>
                                </tr>
                            ) : orderItems?.length > 0 ? (
                                orderItems.map((item, index) => {
                                    const img = safeFirstImage(item.product_image);

                                    return (
                                        <tr key={item.order_child_id || index}>
                                            <td>{index + 1}</td>
                                            <td>{item.product_name || "-"}</td>
                                            <td>
                                                {img ? (
                                                    <img
                                                        src={`${api.IMG_URL}product_images/${img}`}
                                                        alt={item.product_name || "product"}
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            objectFit: "cover",
                                                            borderRadius: 8,
                                                            border: "1px solid #e9ecef",
                                                        }}
                                                    />
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>₹ {Number(item.order_child_product_price || 0).toFixed(2)}</td>
                                            <td>{Number(item.order_child_product_qty || 0)}</td>
                                            <td>{Number(item.order_child_gst_percentage || 0).toFixed(2)}%</td>
                                            <td>₹ {Number(item.order_child_gst_amount || 0).toFixed(2)}</td>
                                            <td>₹ {Number(item.order_child_discount || 0).toFixed(2)}</td>
                                            <td>₹ {Number(item.order_child_grand_total || 0).toFixed(2)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-muted">
                                        No items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ModalBody>

            <ModalFooter>
                <Button color="success" onClick={openInvoice} disabled={!orderItems?.length}>
                    Get Invoice
                </Button>
                <Button color="danger" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
            <InvoicePreviewModal
                isOpen={isInvoiceOpen}
                toggle={closeInvoice}
                order={order}
                items={orderItems}
            />
        </Modal>
    );
};

export default OrderViewModal;
