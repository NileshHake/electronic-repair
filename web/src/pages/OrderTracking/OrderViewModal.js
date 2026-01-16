import React, { useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Card,
    Table,
    Badge,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getOrderChildList } from "../../store/order";
import { formatDateTime } from "../../helpers/date_and_time_format";
import { api } from "../../config";

const OrderViewModal = ({ isOpen, toggle, order }) => {
    if (!order) return null;
    const dispatch = useDispatch();
    const { orderItems, loading } = useSelector((state) => state.OrderReducer);

    useEffect(() => {
        if (order?.order_master_id && isOpen) {
            dispatch(
                getOrderChildList({
                    order_id: order.order_master_id,
                })
            );
        }
    }, [order, isOpen, dispatch]);
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
            <ModalHeader toggle={toggle} className="bg-light p-3">
                Order Details #{order.order_master_id}
            </ModalHeader>
            <ModalBody>
                {/* ================= ORDER INFO ================= */}
                <Card className="border card-border-success p-3 shadow-lg">
                    <Card className="shadow-lg border-0 p-4 mb-4 rounded-3">

                        {/* Customer Name & Phone */}
                        <Row className="mb-3 g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-user-line me-2 text-primary fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Name</small>
                                        <span className="fw-semibold text-dark">
                                            {order.order_master_customer_name || order.user_name}
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
                                            {order.order_master_delivery_phone_number}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* City & Pincode */}
                        <Row className="mb-3 g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-map-pin-line me-2 text-warning fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">City</small>
                                        <span className="fw-semibold text-dark">{order.customer_address_description}</span>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-hashtag-line me-2 text-info fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Pincode</small>
                                        <span className="fw-semibold text-dark">{order.customer_address_pincode}</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Order Date & Delivered Date */}
                        <Row className="mb-3 g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-calendar-line me-2 text-secondary fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Order Date</small>
                                        <span className="fw-semibold text-dark">{formatDateTime(order.order_master_date)}</span>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} md={6}>
                                <div className="p-2 bg-light rounded d-flex align-items-center">
                                    <i className="ri-calendar-check-line me-2 text-success fs-5"></i>
                                    <div>
                                        <small className="text-muted d-block">Delivered Date</small>
                                        <span className="fw-semibold text-dark">
                                            {order.order_master_delivered_date ? formatDateTime(order.order_master_delivered_date) : "-"}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Subtotal, GST, Delivery */}
                        <Row className="mb-3 g-2">
                            <Col xs={12} md={4}>
                                <div className="p-2 bg-success-subtle rounded d-flex align-items-center justify-content-between">
                                    <strong>Sub Total:</strong>
                                    <span className="fw-bold text-success">
                                        ₹ {Number(order.order_master_sub_total).toFixed(2)}
                                    </span>
                                </div>
                            </Col>
                            <Col xs={12} md={4}>
                                <div className="p-2 bg-info-subtle rounded d-flex align-items-center justify-content-between">
                                    <strong>GST ({order.order_master_gst_percentage}%):</strong>
                                    <span className="fw-bold text-info">
                                        ₹ {Number(order.order_master_gst_amount).toFixed(2)}
                                    </span>
                                </div>
                            </Col>
                            <Col xs={12} md={4}>
                                <div className="p-2 bg-warning-subtle rounded d-flex align-items-center justify-content-between">
                                    <strong>Delivery Charge:</strong>
                                    <span className="fw-bold text-warning">
                                        ₹ {Number(order.order_master_delivery_charge).toFixed(2)}
                                    </span>
                                </div>
                            </Col>
                        </Row>

                        {/* Total & Status */}
                        <Row className="g-2">
                            <Col xs={12} md={6}>
                                <div className="p-2 rounded d-flex align-items-center justify-content-between bg-primary-subtle">
                                    <strong>Total:</strong>
                                    <span className="fw-bold text-primary fs-5">
                                        ₹ {Number(order.order_master_grand_total).toFixed(2)}
                                    </span>
                                </div>
                            </Col>
                            <Col xs={12} md={6}>
                                <div className="p-2 rounded d-flex align-items-center justify-content-between bg-secondary-subtle">
                                    <strong>Status:</strong>
                                    <Badge
                                        color={
                                            order.order_master_status === 1
                                                ? "success"
                                                : order.order_master_status === 2
                                                    ? "info"
                                                    : order.order_master_status === 3
                                                        ? "primary"
                                                        : order.order_master_status === 4
                                                            ? "warning"
                                                            : order.order_master_status === 5
                                                                ? "danger"
                                                                : "secondary"
                                        }
                                        className="fs-6"
                                        pill
                                    >
                                        {order.order_master_status === 1
                                            ? "Approved"
                                            : order.order_master_status === 2
                                                ? "Packing"
                                                : order.order_master_status === 3
                                                    ? "Dispatch"
                                                    : order.order_master_status === 4
                                                        ? "Delivered"
                                                        : order.order_master_status === 5
                                                            ? "Rejected"
                                                            : "Pending"}
                                    </Badge>
                                </div>
                            </Col>
                        </Row>

                    </Card>



                    {/* ================= ORDER ITEMS ================= */}


                    <div className="table-responsive">
                        <table className="table align-middle table-hover">
                            <thead className="table-light text-uppercase text-muted">
                                <tr>
                                    <th  >#</th>
                                    <th  >Product</th>
                                    <th  >Image</th>
                                    <th  >Price</th>
                                    <th  >Qty</th>
                                    <th  >Per (%)</th>
                                    <th  >GST</th>
                                    <th  >Discount</th>
                                    <th  >Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-3">
                                            Loading items...
                                        </td>
                                    </tr>
                                ) : orderItems.length > 0 ? (
                                    orderItems.map((item, index) => (
                                        <tr key={item.order_child_id}>
                                            <td>{index + 1}</td>
                                            <td>{item.product_name}</td>
                                            <td>
                                                {item.product_image && JSON.parse(item.product_image)[0] ? (
                                                    <img
                                                        src={`${api.IMG_URL}product_images/${JSON.parse(item.product_image)[0]}`}
                                                        alt={item.product_name}
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            objectFit: "cover",
                                                            borderRadius: "4px",
                                                        }}
                                                    />
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>₹ {Number(item.order_child_product_price).toFixed(2)}</td>
                                            <td>
                                                <span  >{item.order_child_product_qty}</span>
                                            </td>
                                            <td>₹ {Number(item.order_child_gst_percentage).toFixed(2)}</td>
                                            <td>₹ {Number(item.order_child_gst_amount).toFixed(2)}</td>
                                            <td>₹ {Number(item.order_child_discount).toFixed(2)}</td>
                                            <td>₹ {Number(item.order_child_grand_total).toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <lord-icon
                                                src="https://cdn.lordicon.com/msoeawqm.json"
                                                trigger="loop"
                                                colors="primary:#405189,secondary:#0ab39c"
                                                style={{ width: "72px", height: "72px" }}
                                            ></lord-icon>
                                            <div className="mt-4">
                                                <h5>No items found</h5>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </Card>
            </ModalBody>

            <ModalFooter>
                <Button color="danger" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default OrderViewModal;
