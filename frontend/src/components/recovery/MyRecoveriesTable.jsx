"use client";

import React, { useMemo, useState } from "react";
import { Modal, ModalBody, ModalHeader, Button } from "reactstrap";
import { useGetMyRecoveriesQuery } from "@/redux/features/recoveryApi";
import { api } from "../../../config";
import RecoveryViewModal from "./RecoveryViewModal";
import { formatDateTime } from "@/helpers/date_and_time";

// ✅ string -> array safe parse
 

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const MyRecoveriesTable = () => {
    const { data, isLoading, isError } = useGetMyRecoveriesQuery();

    // API might return: array OR {data: array}
    const recoveries = useMemo(() => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    }, [data]);
     
    const [isOpen, setIsOpen] = useState(false); 
    const [selected, setSelected] = useState(null);

    

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" />
                <div className="mt-2">Loading recoveries...</div>
            </div>
        );
    }

    if (isError) {
        return <div className="text-danger py-3">Failed to load recoveries!</div>;
    }

    if (recoveries.length === 0) {
        return <div className="py-3">No recoveries found.</div>;
    }

    const openView = (row) => { setSelected(row); setIsOpen(true); };
    const closeView = () => { setIsOpen(false); setSelected(null); };
    // ✅ if folder name same as column name: recovery_image
   
    return (
        <>
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: 80 }}>#</th>

                            {/* ✅ keep only the fields you want to show in table */}
                            <th>Problem</th>
                            <th>Received Date</th>
                            <th>Workflow</th>
                            <th>Stage</th>
                            <th>Vendor</th>

                            {/* ✅ action */}
                            <th style={{ width: 100 }} className="text-center">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {recoveries.map((r, idx) => (
                            <tr key={r.recovery_id ?? idx}>
                                <td>{idx + 1}</td>

                                <td style={{ maxWidth: 260 }}>
                                    <div className="text-truncate" title={toText(r.recovery_problem_description)}>
                                        {toText(r.recovery_problem_description)}
                                    </div>
                                </td>

                                <td>{formatDateTime(r.recovery_received_date)}</td>

                                {/* because your SQL joins wf.* and wf_child.* */}
                                <td>{toText(r.workflow_name ?? r.workflow_title ?? r.workflow_id)}</td>
                                <td>{toText(r.workflow_child_name ?? r.workflow_stage_name ?? r.workflow_child_id)}</td>

                                {/* vendor/created_by */}
                                <td>{toText(r.recovery_created_by_name ?? r.vendor_name ?? r.recovery_created_by)}</td>

                                {/* ✅ Eye button */}
                                <td className="text-center">
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => openView(r)}>
                                        👁
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <RecoveryViewModal isOpen={isOpen} toggle={closeView} recovery={selected} />
        </>
    );
};

export default MyRecoveriesTable;