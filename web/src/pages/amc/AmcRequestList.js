import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import DeleteModal from "../../Components/Common/DeleteModal";
import AmcRequestView from "./AmcRequestView";
import Select from "react-select";
import {
    getAmcRequests,
    deleteAmcRequest,
    updateAmcRequest,
    updateAmcRequestStatus,
} from "../../store/amc/AmcRequest/index";
import { formatDateTime } from "../../helpers/date_and_time_format";
import CreateQuoteModal from "./CreateQuoteModal";
const statusOptions = [
    { value: "pending", label: "Pending", color: "#e5ba0e" },
    { value: "Accept", label: "Accept", color: "#28a745" },
    { value: "Quotation Created", label: "Quotation Created", color: "#17a2b8" },
    { value: "Rejected", label: "Rejected", color: "#dc3545" },
];
const AmcRequestList = () => {
    document.title = "AMC Requests";

    const dispatch = useDispatch();
    const { amcRequests } = useSelector((state) => state.AmcRequestReducer);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [requestData, setRequestData] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [quoteRequest, setQuoteRequest] = useState(null);

    useEffect(() => {
        dispatch(getAmcRequests());
    }, [dispatch]);

    const onClickDelete = (item) => {
        setSelectedRequest(item);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (selectedRequest) {
            dispatch(deleteAmcRequest(selectedRequest.amc_request_id));
        }
        setDeleteModal(false);
    };

    const selectStyles = {

        control: (styles, { selectProps }) => ({
            ...styles,
            backgroundColor: selectProps.value?.color + "20",
            borderColor: selectProps.value?.color,
            minHeight: "35px"
        }),

        option: (styles, { data, isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected
                ? data.color
                : isFocused
                    ? data.color
                    : "#fff",
            color: isSelected || isFocused ? "#fff" : "#333"
        }),

        singleValue: (styles, { data }) => ({
            ...styles,
            color: data.color,
            fontWeight: 600
        })

    };

    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="mb-0 fw-bold">AMC Request List</h5>
                                    </div>
                                </Row>
                            </CardHeader>

                            <CardBody className="pt-0">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light text-uppercase text-muted">
                                            <tr>
                                                <th>#</th>
                                                <th>Customer</th>
                                                <th>Vendor</th>
                                                <th style={{ minWidth: "250px" }}>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {amcRequests && amcRequests.length > 0 ? (
                                                amcRequests.map((req, index) => (
                                                    <tr key={req.amc_request_id}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            <div className="fw-semibold">
                                                                {req.customer_name || "-"}
                                                            </div>
                                                            <div
                                                                className="text-muted"
                                                                style={{ fontSize: "12px" }}
                                                            >
                                                                {req.customer_email || ""}
                                                                <br />
                                                                {req.customer_phone || ""}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="fw-semibold">
                                                                {req.vendor_name || "-"}
                                                            </div>
                                                            <div
                                                                className="text-muted"
                                                                style={{ fontSize: "12px" }}
                                                            >
                                                                {req.vendor_email || ""}
                                                                <br />
                                                                {req.vendor_phone || ""}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {req.request_status == "Rejected By Customer" ? (
                                                                <span className="text-danger">Rejected By Customer</span>
                                                            ) : <Select
                                                                options={statusOptions}
                                                                styles={selectStyles}
                                                                value={
                                                                    statusOptions.find(
                                                                        (option) => option.value === req.request_status
                                                                    ) || null
                                                                }
                                                                onChange={(selectedOption) => {
                                                                    if (!selectedOption) return;

                                                                    if (selectedOption.value === "Quotation Created") {
                                                                        setQuoteRequest(req);
                                                                        setIsQuoteOpen(true);
                                                                        return;
                                                                    }

                                                                    dispatch(
                                                                        updateAmcRequestStatus({
                                                                            request_id: req.request_id,
                                                                            request_status: selectedOption.value,
                                                                        })
                                                                    );
                                                                }}
                                                                placeholder="Select status"
                                                            />}

                                                        </td>

                                                        <td>{formatDateTime(req.createdAt)}</td>

                                                        <td>
                                                            <ul className="list-inline hstack gap-2 mb-0">
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => {
                                                                            setRequestData(req);
                                                                            setIsViewOpen(true);
                                                                        }}
                                                                    >
                                                                        <i className="ri-eye-fill fs-16"></i>
                                                                    </button>
                                                                </li>

                                                                {/* <li c  */}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-5">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#405189,secondary:#0ab39c"
                                                            style={{ width: "72px", height: "72px" }}
                                                        ></lord-icon>

                                                        <div className="mt-4">
                                                            <h5>No AMC Requests Found</h5>
                                                        </div>
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

            <AmcRequestView
                isOpen={isViewOpen}
                toggle={() => setIsViewOpen(false)}
                requestData={requestData}
            />
            <CreateQuoteModal
                isOpen={isQuoteOpen}
                toggle={() => setIsQuoteOpen(false)}
                requestData={quoteRequest}
            />
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default AmcRequestList;