import { useGetUserOrderListQuery } from "@/redux/features/orderApi";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Badge } from "reactstrap";
import OrderViewModal from "./OrderViewModal"; // ✅ path adjust
import "remixicon/fonts/remixicon.css";

// ✅ status helpers (your logic)
const getStatusMeta = (s) => {
  const n = Number(s);

  if (n === 1) return { text: "Approved", color: "success" };
  if (n === 2) return { text: "Packing", color: "info" };
  if (n === 3) return { text: "Dispatch", color: "primary" };
  if (n === 4) return { text: "Delivered", color: "warning" };
  if (n === 5) return { text: "Rejected", color: "danger" };

  return { text: "Pending", color: "secondary" };
};

const MyOrders = () => {
  const { data, isLoading, isError } = useGetUserOrderListQuery();
  const order_items = data?.orders || data || [];

  // ✅ modal states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="profile__ticket d-flex justify-content-center align-items-center" style={{ height: 200 }}>
        <span>Loading orders...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="profile__ticket text-center text-danger">Failed to load orders</div>;
  }

  return (
    <div className="profile__ticket">
      {order_items.length === 0 ? (
        <div
          style={{ height: 220 }}
          className="d-flex align-items-center justify-content-center text-muted"
        >
          <div className="text-center">
            <i
              style={{ fontSize: 34, opacity: 0.6 }}
              className="fa-solid fa-cart-circle-xmark mb-2"
            ></i>
            <p className="mb-0 fw-semibold">You have no orders yet</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="table align-middle mb-0 table-hover">
            <thead
              className="bg-white sticky-top"
              style={{ top: 0, zIndex: 1, borderBottom: "1px solid #eee" }}
            >
              <tr className="text-muted text-uppercase small">
                <th>Order ID</th>
                <th>Order Time</th>
                <th className="text-center">Status</th>
                <th className="text-center">View</th>
              </tr>
            </thead>

            <tbody>
              {order_items.map((item, index) => {
                const id = item.order_master_id || item._id;
                const meta = getStatusMeta(item.order_master_status);

                return (
                  <tr
                    key={id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#fcfcff",
                    }}
                  >
                    <td className="fw-semibold">#{String(id).slice(-5)}</td>

                    <td className="text-muted">
                      {dayjs(item.createdAt || item.order_master_date).format(
                        "MMMM D, YYYY"
                      )}
                    </td>

                    <td className="text-center">
                      <Badge
                        color={meta.color}
                        pill
                        className="px-3 py-2 fw-semibold"
                      >
                        {meta.text}
                      </Badge>
                    </td>

                    {/* 👁 Eye Icon */}
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-circle"
                        style={{
                          width: 36,
                          height: 36,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => openModal(item)}
                        title="View Order"
                      >
                        <i className="ri-eye-line fs-5 text-dark"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Order View Modal */}
      <OrderViewModal
        isOpen={isOpen}
        toggle={closeModal}
        order={selectedOrder}
      />
    </div>

  );
};

export default MyOrders;
