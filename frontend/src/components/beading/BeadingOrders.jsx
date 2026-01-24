"use client";

import React, { useMemo, useState } from "react";
import { useGetBeadingListQuery } from "@/redux/features/beadingApi";
import { api } from "../../../config";
import BeadingDetailsModal from "./BeadingDetailsModal";

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

const parseImgs = (imagesString) => {
    if (!imagesString) return [];
    return String(imagesString)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
};

const BeadingOrders = () => {
    const { data, isLoading, isError } = useGetBeadingListQuery();

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(null);

    const baseURL = useMemo(() => {
        const u = api?.IMG_URL || "";
        return u.endsWith("/") ? u : u + "/";
    }, []);

    const openModal = (row) => {
        setActive(row);
        setOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setOpen(false);
        setActive(null);
        document.body.style.overflow = "auto";
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
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((o, idx) => {
                                        const imgs = parseImgs(o?.beading_request_images);

                                        return (
                                            <tr key={o?.beading_request_id || idx}>
                                                <td>{o?.beading_request_id || idx + 1}</td>

                                                <td style={{ minWidth: 180 }}>
                                                    <div className="fw-bold">{o?.beading_request_title}</div>
                                                    <div className="text-muted small">
                                                        {o?.beading_request_description?.slice(0, 60)}
                                                        {o?.beading_request_description?.length > 60 ? "..." : ""}
                                                    </div>
                                                </td>

                                                <td>
                                                    ₹{o?.beading_budget_min || 0} - ₹{o?.beading_budget_max || 0}
                                                </td>

                                                <td>{o?.beading_location || "-"}</td>

                                                <td>
                                                    <span className={statusClass(o?.beading_request_status)}>
                                                        {statusText(o?.beading_request_status)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {o?.expires_at ? new Date(o.expires_at).toLocaleDateString() : "-"}
                                                </td>

                                            

                                                {/* ✅ Eye Button */}
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-dark"
                                                        onClick={() => openModal(o)}
                                                        title="View Details"
                                                    >
                                                        👁
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <BeadingDetailsModal
                open={open}
                onClose={closeModal}
                data={active}
                imgBaseUrl={baseURL}
            />
        </>
    );
};

export default BeadingOrders;
