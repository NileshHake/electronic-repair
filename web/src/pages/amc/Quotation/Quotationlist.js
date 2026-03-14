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

import {
    getAmcQuotations,
    deleteAmcQuotation,
    getChildAmcQuotation,
} from "../../../store/amc/AmcQuotation/index";

import DeleteModal from "../../../Components/Common/DeleteModal";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import QuotationView from "./QuotationView";
import UpdateQuotationModal from "./UpdateQuotationModal";

const QuotationList = () => {
    document.title = "AMC Quotations";

    const dispatch = useDispatch();

    const { amcQuotations, loading, childQuotationItems } = useSelector(
        (state) => state.AmcQuotationReducer
    );

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [quotationData, setQuotationData] = useState(null);


    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editQuotationData, setEditQuotationData] = useState(null);
    useEffect(() => {
        dispatch(getAmcQuotations());
    }, [dispatch]);

    const onClickDelete = (item) => {
        setSelectedQuotation(item);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (selectedQuotation) {
            dispatch(deleteAmcQuotation(selectedQuotation.quotation_id));
        }
        setDeleteModal(false);
        setSelectedQuotation(null);
    };

    const handleViewQuotation = (item) => {
        setQuotationData(item);
        dispatch(getChildAmcQuotation(item.quotation_id));
        setIsViewOpen(true);
    };

    const handleEditQuotation = (item) => {
        setEditQuotationData(item);
        dispatch(getChildAmcQuotation(item.quotation_id));
        setIsEditOpen(true);
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
                                        <h5 className="mb-0 fw-bold">AMC Quotation List</h5>
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
                                                <th>Quotation No</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {!loading && amcQuotations && amcQuotations.length > 0 ? (
                                                amcQuotations.map((item, index) => (
                                                    <tr key={item.quotation_id || index}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            <div className="fw-semibold">
                                                                {item.customer_name || "-"}
                                                            </div>
                                                            <div
                                                                className="text-muted"
                                                                style={{ fontSize: "12px" }}
                                                            >
                                                                {item.customer_email || ""}
                                                                <br />
                                                                {item.customer_phone || ""}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="fw-semibold">
                                                                {item.vendor_name || "-"}
                                                            </div>
                                                            <div
                                                                className="text-muted"
                                                                style={{ fontSize: "12px" }}
                                                            >
                                                                {item.vendor_email || ""}
                                                                <br />
                                                                {item.vendor_phone || ""}
                                                            </div>
                                                        </td>

                                                        <td>{item.quotation_number || "-"}</td>

                                                        <td>
                                                            {item.total_amount !== undefined &&
                                                                item.total_amount !== null
                                                                ? `₹ ${item.total_amount}`
                                                                : "-"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`badge ${item.quotation_status === "sent"
                                                                    ? "bg-warning"
                                                                    : item.quotation_status === "approved"
                                                                        ? "bg-success"
                                                                        : item.quotation_status === "rejected"
                                                                            ? "bg-danger"
                                                                            : "bg-secondary"
                                                                    }`}
                                                            >
                                                                {item.quotation_status || "-"}
                                                            </span>
                                                        </td>

                                                        <td>{formatDateTime(item.createdAt)}</td>

                                                        <td>
                                                            <ul className="list-inline hstack gap-2 mb-0">
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => handleViewQuotation(item)}
                                                                    >
                                                                        <i className="ri-eye-fill fs-16"></i>
                                                                    </button>
                                                                </li>
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => handleEditQuotation(item)}
                                                                    >
                                                                        <i className="ri-pencil-fill fs-16"></i>
                                                                    </button>
                                                                </li>


                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-5">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#405189,secondary:#0ab39c"
                                                            style={{ width: "72px", height: "72px" }}
                                                        ></lord-icon>

                                                        <div className="mt-4">
                                                            <h5>No AMC Quotations Found</h5>
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

            <QuotationView
                isOpen={isViewOpen}
                toggle={() => setIsViewOpen(false)}
                quotationData={quotationData}
                childQuotationItems={childQuotationItems}
            />

            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />

            <UpdateQuotationModal
                isOpen={isEditOpen}
                toggle={() => setIsEditOpen(false)}
                quotationData={editQuotationData}
                childQuotationItems={childQuotationItems}
            />
        </div>
    );
};

export default QuotationList;