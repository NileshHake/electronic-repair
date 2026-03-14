import React, { useState } from "react";
import {
    Button
} from "reactstrap";

import AmcAddModal from "./AmcAddModal";
import AmcUpdateModal from "./AmcUpdateModal";
import QuotationView from "./QuotationView";

import {
    useGetAmcRequestListQuery,
    useDeleteAmcRequestMutation
} from "../../redux/features/amcRequestApi";

const AmcArea = () => {

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isData, setIsData] = useState(null);

    const [viewId, setViewId] = useState(null);

    const toggleAddModal = () => {
        setIsAddOpen(!isAddOpen);
    };

    const toggleUpdateModal = () => {
        setIsUpdateOpen(!isUpdateOpen);
        setIsData(null);
    };

    // API CALL
    const {
        data: amcList = [],
        isLoading,
        isError
    } = useGetAmcRequestListQuery();

    const [deleteAmc] = useDeleteAmcRequestMutation();

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this AMC request?")) {
            await deleteAmc(id);
        }
    };

    const handleUpdate = async (data) => {
        setIsData(data);
        setIsUpdateOpen(!isUpdateOpen);
    };

    const statusOptions = [
        { value: "pending", label: "Pending", color: "#e5ba0e" },
        { value: "Accept", label: "Accept", color: "#28a745" },
        { value: "Quotation Created", label: "Quotation Created", color: "#17a2b8" },
        { value: "Rejected", label: "Rejected", color: "#dc3545" },
    ];

    return (
        <div className="container mt-4">

            <div className="row">

                <div className="col-12 pb-3">

                    <div className="card shadow-sm">

                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">

                            <h5 className="mb-0 fw-bold text-dark">
                                My AMC Requests
                            </h5>

                            <Button color="success" onClick={toggleAddModal}>
                                + Add AMC Request
                            </Button>

                        </div>

                        {/* Table */}
                        <div className="card-body">

                            <div className="table-responsive">

                                <table className="table align-middle table-hover">

                                    <thead className="table-light text-uppercase text-muted">

                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Vendor</th>
                                            <th>City</th>
                                            <th>Mobile</th>
                                            <th>Status</th>
                                            <th>Service Settings</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {/* Loading */}

                                        {isLoading && (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4">
                                                    Loading...
                                                </td>
                                            </tr>
                                        )}

                                        {/* Error */}

                                        {isError && (
                                            <tr>
                                                <td colSpan="8" className="text-center text-danger py-4">
                                                    Failed to load AMC Requests
                                                </td>
                                            </tr>
                                        )}

                                        {/* Data */}

                                        {!isLoading && amcList.length > 0 ? (

                                            amcList.map((amc, index) => {

                                                const status = statusOptions.find(
                                                    (s) => s.value == amc.request_status
                                                );

                                                return (

                                                    <tr key={amc.request_id}>

                                                        <td>{index + 1}</td>

                                                        {/* Customer */}

                                                        <td>
                                                            {amc.customer_name}
                                                            <br />
                                                            <small className="text-muted">
                                                                {amc.customer_email}
                                                            </small>
                                                        </td>

                                                        {/* Vendor */}

                                                        <td>
                                                            {amc.vendor_name}
                                                            <br />
                                                            <small className="text-muted">
                                                                {amc.vendor_phone}
                                                            </small>
                                                        </td>

                                                        {/* City */}

                                                        <td>{amc.customer_address_city}</td>

                                                        {/* Mobile */}

                                                        <td>{amc.customer_address_mobile}</td>

                                                        {/* Status */}

                                                        <td>

                                                            <span
                                                                className="badge"
                                                                style={{
                                                                    backgroundColor: status?.color || "#6c757d",
                                                                    color: "#fff",
                                                                    padding: "6px 10px",
                                                                    fontSize: "12px"
                                                                }}
                                                            >
                                                                {status?.label || amc.request_status}
                                                            </span>

                                                        </td>

                                                        {/* Service Settings */}

                                                        <td>

                                                            <div className="small">

                                                                <div>
                                                                    <strong>Service:</strong>{" "}
                                                                    {amc.service_type === "carry_in" ? "Carry In" : "On Site"}
                                                                </div>

                                                                <div>
                                                                    <strong>Billing:</strong>{" "}
                                                                    {amc.billing_type === "monthly" ? "Monthly Billing" : "Annual Billing"}
                                                                </div>

                                                                <div>
                                                                    <strong>AutoPay:</strong>{" "}
                                                                    {amc.autopay === "on" ? "Enabled" : "Disabled"}
                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* Actions */}

                                                        <td>

                                                            <ul className="list-inline hstack gap-2 mb-0">

                                                                {amc.request_status === "Quotation Created" && (

                                                                    <li className="list-inline-item">

                                                                        <button
                                                                            className="text-primary border-0 bg-transparent"
                                                                            onClick={() =>
                                                                                amc.quotation_id &&
                                                                                setViewId(amc.quotation_id)
                                                                            }
                                                                        >
                                                                            View
                                                                        </button>

                                                                    </li>

                                                                )}

                                                                <li className="list-inline-item">

                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => handleUpdate(amc)}
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                </li>

                                                                <li className="list-inline-item">

                                                                    <button
                                                                        className="text-danger border-0 bg-transparent"
                                                                        onClick={() => handleDelete(amc.request_id)}
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </li>

                                                            </ul>

                                                        </td>

                                                    </tr>

                                                );

                                            })

                                        ) : (

                                            !isLoading && (

                                                <tr>

                                                    <td colSpan="8" className="text-center py-4">

                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#405189,secondary:#0ab39c"
                                                            style={{ width: "72px", height: "72px" }}
                                                        ></lord-icon>

                                                        <h6 className="mt-3 text-muted">
                                                            No AMC Requests Found
                                                        </h6>

                                                    </td>

                                                </tr>

                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Add AMC Modal */}
            {isAddOpen && (
                <AmcAddModal
                    isOpen={isAddOpen}
                    toggle={toggleAddModal}
                />
            )}

            {/* Update AMC Modal */}
            {isUpdateOpen && (
                <AmcUpdateModal
                    isOpen={isUpdateOpen}
                    toggle={toggleUpdateModal}
                    data={isData}
                />
            )}

            {/* View Quotation Modal */}
            {viewId && (
                <QuotationView
                    isOpen={!!viewId}
                    toggle={() => setViewId(null)}
                    quotationId={viewId}
                />
            )}

        </div>
    );
};

export default AmcArea;