import React, { useState } from "react";
import { Table, Badge, Button } from "reactstrap";
import { useGetRentalRequestListQuery, useDownloadRentalInvoiceMutation } from "@/redux/features/rentalRequestApi";
import RentalRequestViewModal from "./RentalRequestViewModal";
const getStatus = (status) => {
    switch (Number(status)) {
        case 0:
            return <Badge color="warning">Pending</Badge>;
        case 1:
            return <Badge color="success">Accepted</Badge>;
        case 2:
            return <Badge color="info">Shipped</Badge>;
        case 3:
            return <Badge color="primary">Active</Badge>;
        case 4:
            return <Badge color="danger">Cancelled</Badge>;
        case 5:
            return <Badge color="secondary">Expired</Badge>;
        case 6:
            return <Badge color="dark">Returned</Badge>;
        default:
            return "-";
    }
};

const RentalRequests = () => {
    const [downloadInvoice] = useDownloadRentalInvoiceMutation();

    const { data = [], isLoading } = useGetRentalRequestListQuery();

    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
            >
                <Table className="table align-middle table-hover">
                    <thead
                        className="table-light"
                        style={{ position: "sticky", top: 0, zIndex: 1 }}
                    >
                        <tr>
                            <th>#</th>
                            <th>Device</th>
                            <th>Rent Type</th>
                            <th>Duration</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {data.length > 0 ? (
                            data.map((r, index) => (

                                <tr key={r.rental_request_id}>

                                    <td>{index + 1}</td>

                                    <td>
                                        <div className="fw-semibold">
                                            {r.device_name}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            {r.device_model}
                                        </div>
                                    </td>

                                    <td>{r.rent_type}</td>

                                    <td>{r.duration}</td>

                                    <td className="fw-semibold">
                                        ₹ {r.total_amount}
                                    </td>

                                    <td>{getStatus(r.request_status)}</td>

                                    <td className="text-center">

                                        {(r.request_status == 3 || r.request_status == 5 || r.request_status == 6) && (
                                            <Button
                                                size="sm"
                                                color="success"
                                                className="me-2"
                                                onClick={() => downloadInvoice(r.rental_request_id)}
                                            >
                                                Invoice
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={() => {
                                                setViewData(r);
                                                setViewModal(true);
                                            }}
                                        >
                                            View
                                        </Button>

                                    </td>

                                </tr>

                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-5">
                                    No Rental Requests Found
                                </td>
                            </tr>
                        )}

                    </tbody>

                </Table>

            </div>

            {viewModal && (
                <RentalRequestViewModal
                    isOpen={viewModal}
                    toggle={() => setViewModal(false)}
                    data={viewData}
                />
            )}
        </>
    );
};

export default RentalRequests;