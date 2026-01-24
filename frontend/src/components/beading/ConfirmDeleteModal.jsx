"use client";

import React, { useMemo, useState } from "react";
import { useGetBeadingListQuery, useDeleteBeadingMutation } from "@/redux/features/beadingApi";
import { api } from "../../../config";
import BeadingDetailsModal from "./BeadingDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const statusText = (s) => {
  const n = Number(s);
  if (n === 0) return "Pending";
  if (n === 1) return "Accepted";
  if (n === 2) return "In Progress";
  if (n === 3) return "Completed";
  if (n === 4) return "Rejected";
  return "Unknown";
};

const statusClass = (s) => {
  const n = Number(s);
  if (n === 0) return "badge bg-warning text-dark";
  if (n === 1) return "badge bg-primary";
  if (n === 2) return "badge bg-info text-dark";
  if (n === 3) return "badge bg-success";
  if (n === 4) return "badge bg-danger";
  return "badge bg-secondary";
};

const BeadingOrders = () => {
  const { data, isLoading, isError } = useGetBeadingListQuery();
  const [deleteBeading, { isLoading: deleting }] = useDeleteBeadingMutation();

  // details modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  const baseURL = useMemo(() => {
    const u = api?.IMG_URL || "";
    return u.endsWith("/") ? u : u + "/";
  }, []);

  const openDetails = (row) => {
    setActive(row);
    setOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setOpen(false);
    setActive(null);
    document.body.style.overflow = "auto";
  };

  const openConfirm = (row) => {
    setDeleteRow(row);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setDeleteRow(null);
  };

  const doDelete = async () => {
    const id = deleteRow?.beading_request_id;
    if (!id) return;

    try {
      await deleteBeading(id).unwrap(); // ✅ invalidatesTags will refetch
      closeConfirm();

      // if details modal open for same item, close it
      if (active?.beading_request_id === id) closeDetails();
    } catch (e) {
      console.log("delete error", e);
    }
  };

  if (isLoading)
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-0">Loading Beading Orders...</h4>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-0 text-danger">Failed to load orders</h4>
        </div>
      </div>
    );

  const orders = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="card-title mb-0">Beading Orders</h3>
            <span className="badge bg-dark">{orders.length}</span>
          </div>

          {orders.length === 0 ? (
            <p className="text-muted mb-0">No orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Budget</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th className="text-center">View</th>
                    <th className="text-center">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o, idx) => (
                    <tr key={o?.beading_request_id || idx}>
                      <td>{o?.beading_request_id || idx + 1}</td>

                      <td style={{ minWidth: 180 }}>
                        <div className="fw-bold">{o?.beading_request_title}</div>
                        <div className="text-muted small">
                          {o?.beading_request_description?.slice(0, 60)}
                          {o?.beading_request_description?.length > 60 ? "..." : ""}
                        </div>
                      </td>

                      <td>₹{o?.beading_budget_min || 0} - ₹{o?.beading_budget_max || 0}</td>
                      <td>{o?.beading_location || "-"}</td>

                      <td>
                        <span className={statusClass(o?.beading_request_status)}>
                          {statusText(o?.beading_request_status)}
                        </span>
                      </td>

                      <td>{o?.expires_at ? new Date(o.expires_at).toLocaleDateString() : "-"}</td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => openDetails(o)}
                          title="View Details"
                        >
                          👁
                        </button>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openConfirm(o)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <BeadingDetailsModal open={open} onClose={closeDetails} data={active} imgBaseUrl={baseURL} />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={closeConfirm}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete Beading Request"
        message={
          deleteRow?.beading_request_id
            ? `Are you sure you want to delete Request #${deleteRow.beading_request_id}?`
            : "Are you sure you want to delete this request?"
        }
      />
    </>
  );
};

export default BeadingOrders;
