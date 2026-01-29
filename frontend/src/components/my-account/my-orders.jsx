import { useGetUserOrderListQuery } from "@/redux/features/orderApi";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Badge } from "reactstrap";
import OrderViewModal from "./OrderViewModal"; // ✅ path adjust

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
        <div style={{ height: 210 }} className="d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i style={{ fontSize: 30 }} className="fa-solid fa-cart-circle-xmark"></i>
            <p>You have no orders yet!</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="table align-middle mb-0">
            <thead className="bg-white sticky-top" style={{ top: 0, zIndex: 1 }}>
              <tr>
                <th>Order Id</th>
                <th>Order Time</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>

            <tbody>
              {order_items.map((item) => {
                const id = item.order_master_id || item._id;
                const meta = getStatusMeta(item.order_master_status);

                return (
                  <tr key={id}>
                    <th>#{String(id).slice(-5)}</th>
                    <td>{dayjs(item.createdAt || item.order_master_date).format("MMMM D, YYYY")}</td>

                    <td>
                      <div className="p-2 rounded d-flex align-items-center justify-content-between bg-secondary-subtle">
                        <Badge color={meta.color} className="fs-6" pill>
                          {meta.text}
                        </Badge>
                      </div>
                    </td>

                    {/* ✅ Eye icon opens modal */}
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => openModal(item)}
                        title="View Order"
                      >
                        <i className="ri-eye-fill"></i>
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
      <OrderViewModal isOpen={isOpen} toggle={closeModal} order={selectedOrder} />
    </div>
  );
};

export default MyOrders;
