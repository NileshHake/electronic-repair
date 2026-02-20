import React from "react";
import { useGetMyRepairsQuery } from "@/redux/features/repairApi";
import { formatDateTime } from "@/helpers/date_and_time";

const getStatusColor = (status = "") => {
    const s = status.toLowerCase();

    if (s.includes("complete")) return "bg-success";
    if (s.includes("pending")) return "bg-warning text-dark";
    if (s.includes("progress")) return "bg-primary";
    if (s.includes("cancel")) return "bg-danger";

    return "bg-secondary";
};

const MyRepairsTable = () => {
    const { data: repairs = [], isLoading, isError } = useGetMyRepairsQuery();

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading repairs...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mt-5 text-center text-danger">
                <h5>⚠ Failed to load repairs</h5>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0">


                <div className="card-body p-0">
                    {repairs.length === 0 ? (
                        <div className="text-center py-5">
                            <h6 className="text-muted">No repairs found</h6>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="text-center">
                                        <th>#</th>

                                        <th>Device</th>
                                        <th>Brand</th>
                                        <th>Technician</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {repairs.map((repair, index) => (
                                        <tr key={repair.repair_id}>
                                            <td className="text-center fw-semibold">
                                                {index + 1}
                                            </td>



                                            <td>{repair.device_type_name || "-"}</td>
                                            <td>{repair.brand_name || "-"}</td>
                                            



                                            <td>{repair.technician_name || "-"}</td>
                                            <td className="text-center">
                                                {formatDateTime(repair.repair_received_date)}
                                            </td>
                                            <td>
                                                <span className={`badge ${repair.workflow_stage_color}`}>
                                                    {repair.workflow_stage_name}
                                                </span>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRepairsTable;
