"use client";

import React, { useMemo, useState } from "react";
import { useGetMyRepairsQuery } from "@/redux/features/repairApi";
import { formatDateTime } from "@/helpers/date_and_time";
import RepairViewModal from "./RepairViewModal";

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const MyRepairsTable = () => {
  const { data, isLoading, isError } = useGetMyRepairsQuery();

  // API could return [] OR {data: []}
  const repairs = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const openModal = (repair) => {
    setSelectedRepair(repair);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedRepair(null);
  };

  const stageName =
    (r) => r.workflow_child_name || r.workflow_stage_name || r.workflow_stage || "-";

  const stageBadgeClass =
    (r) => r.workflow_child_color || r.workflow_stage_color || "bg-secondary";

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
                    <th style={{ width: 70 }}>#</th>

                    <th className="text-start">Device</th>
                    <th className="text-start">Brand</th>

                    <th className="text-start">Technician</th>
                    <th>Date</th>

                    <th>Status</th>
                    <th style={{ width: 90 }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {repairs.map((r, index) => (
                    <tr key={r.repair_id || index}>
                      <td className="text-center fw-semibold">{index + 1}</td>

                      <td className="text-start">
                        {toText(r.device_type_name || r.repair_device_type_name)}
                      </td>

                      <td className="text-start">
                        {toText(r.brand_name || r.repair_device_brand_name)}
                      </td>

                      <td className="text-start">{toText(r.technician_name)}</td>

                      <td className="text-center">
                        {r.repair_received_date ? formatDateTime(r.repair_received_date) : "-"}
                      </td>

                      <td className="text-center">
                        <span className={`badge ${stageBadgeClass(r)}`}>
                          {toText(stageName(r))}
                        </span>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: 8, fontWeight: 600 }}
                          onClick={() => openModal(r)}
                          title="View"
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <RepairViewModal
                isOpen={isOpen}
                toggle={closeModal}
                repair={selectedRepair}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRepairsTable;