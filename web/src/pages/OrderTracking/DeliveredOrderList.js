import React, { useEffect, useState, useRef } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersList, updateOrderStatusAdmin } from "../../store/order";
import { formatDateTime } from "../../helpers/date_and_time_format";
import Select from "react-select";
import OrderViewModal from "./OrderViewModal";

const DeliveredOrderList = () => {
    document.title = "All Order List";

    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.OrderReducer);



    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);


    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const tableRef = useRef(null);

    /* ================= FIRST LOAD ================= */
    useEffect(() => {
        dispatch(getOrdersList({ order_status: 5, page: 1, limit: 10 }));
    }, [dispatch]);

    /* ================= INFINITE SCROLL ================= */
    const handleScroll = () => {
        const el = tableRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            const nextPage = page + 1;
            setPage(nextPage);

            dispatch(
                getOrdersList({
                    order_status: 5,
                    page: nextPage,
                    limit: 10,
                })
            );
        }
    };

    /* ================= STOP WHEN NO DATA ================= */
    useEffect(() => {
        if (orders.length !== 0 && orders.length % 10 !== 0) {
            setHasMore(false);
        }
    }, [orders]);
    const openViewModal = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };
    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="border-0">
                                <h5 className="mb-0 fw-bold">Order List</h5>
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
                                                <th>Order No</th>
                                                <th>Customer</th>
                                                <th>Contact</th>
                                                <th>City</th>
                                                <th>Pincode</th>
                                                <th>Order Date</th>
                                                <th>Payment</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                                <th>action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orders && orders.length > 0 ? (
                                                orders.map((order, index) => (
                                                    <tr key={order.order_master_id}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            <strong>#{order.order_master_id}</strong>
                                                        </td>

                                                        <td>{order.user_name}</td>

                                                        <td>{order.order_master_delivery_phone_number}</td>

                                                        <td>{order.customer_address_city}</td>

                                                        <td>{order.customer_address_pincode}</td>

                                                        <td>{formatDateTime(order.order_master_date)}</td>


                                                        <td>
                                                            <span
                                                                className={`badge ${order.order_master_payment_status === "PAID"
                                                                    ? "bg-success"
                                                                    : "bg-warning"
                                                                    }`}
                                                            >
                                                                {order.order_master_payment_status}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                ₹{" "}
                                                                {Number(
                                                                    order.order_master_grand_total || 0
                                                                ).toFixed(2)}
                                                            </strong>
                                                        </td>

                                                        <td className="text-success fw-bold"  >
                                                            Delivered
                                                        </td>
                                                        <td className="text-center">
                                                            <ul className="list-inline hstack   mb-0">
                                                                <li className="list-inline-item edit">
                                                                    <button
                                                                        className="text-primary d-inline-block edit-item-btn border-0 bg-transparent"
                                                                        onClick={() => openViewModal(order)}
                                                                    >
                                                                        <i className="ri-eye-fill fs-16" />
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : !loading ? (
                                                <tr>
                                                    <td colSpan="10" className="text-center py-5">
                                                        <h5>No Orders Found</h5>
                                                    </td>
                                                </tr>
                                            ) : null}

                                            {loading && (
                                                <tr>
                                                    <td colSpan="10" className="text-center py-3">
                                                        Loading more orders...
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
            {modalOpen &&
                <OrderViewModal
                    isOpen={modalOpen}
                    toggle={() => setModalOpen(!modalOpen)}
                    order={selectedOrder}
                />
            }
        </div>
    );
};

export default DeliveredOrderList;
