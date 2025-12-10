import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
    getQuotationBilling,
    deleteQuotationBilling,
    resetUpdateQuotationBillingResponse,
} from "../../../store/QuotationAndBilling";
import AuthUser from "../../../helpers/AuthType/AuthUser";
import QuotationAndBillingAdd from "./QuotationAndBillingAdd"; // Add modal component
import QuotationAndBillingUpdate from "./QuotationAndBillingUpdate"; // Update modal component
import DeleteModal from "../../../Components/Common/DeleteModal";

const QuotationAndBillingList = () => {
    document.title = "Quotation & Billing List";

    const dispatch = useDispatch();
    const { quotationBillingList, updateResponse } = useSelector(
        (state) => state.QuotationBillingReducer
    );


    const { permissions } = AuthUser();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);

    // Fetch quotations on mount
    useEffect(() => {
        dispatch(getQuotationBilling());
    }, [dispatch]);
    useEffect(() => {
        if (updateResponse) {
            setIsUpdateOpen(false);

            dispatch(resetUpdateQuotationBillingResponse());

            // Optionally, refresh the list
            dispatch(getQuotationBilling());
        }
    }, [updateResponse, dispatch]);
    // Keyboard shortcuts: Alt + A (Add), Alt + C (Close Add)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.altKey && event.key.toLowerCase() === "a") {
                event.preventDefault();
                setIsAddOpen(true);
            }
            if (event.altKey && event.key.toLowerCase() === "c") {
                event.preventDefault();
                setIsAddOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Permission checks
    const canUpdate = permissions.some(
        (p) => p.permission_category === "QUOTATION_BILLING" && p.permission_path === "3"
    );
    const canDelete = permissions.some(
        (p) => p.permission_category === "QUOTATION_BILLING" && p.permission_path === "4"
    );

    // Delete handlers
    const onClickDelete = (quotation) => {
        setSelectedQuotation(quotation);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (selectedQuotation) {
            dispatch(
                deleteQuotationBilling(selectedQuotation.quotation_and_billing_master_id)
            );
        }
        setDeleteModal(false);
    };

    return (
        <div className="page-content">
            <Container fluid>
                <ToastContainer closeButton={false} limit={1} autoClose={100} />

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="mb-0 fw-bold">Quotation & Billing List</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <Button color="success" onClick={() => setIsAddOpen(true)}>
                                            + Add Quotation
                                        </Button>
                                    </div>
                                </Row>
                            </CardHeader>

                            <CardBody className="pt-0">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover">
                                        <thead className="table-light text-uppercase text-muted">
                                            <tr>
                                                <th>#</th>
                                                <th>Invoice Number</th>
                                                <th>Date</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>GST Amount</th>
                                                <th>Grand Total</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotationBillingList && quotationBillingList.length > 0 ? (
                                                quotationBillingList.map((q, index) => (
                                                    <tr key={q.quotation_and_billing_master_id}>
                                                        <td>{index + 1}</td>
                                                        <td>{q.quotation_and_billing_master_invoice_number}</td>
                                                        <td>
                                                            {new Date(
                                                                q.quotation_and_billing_master_date
                                                            ).toLocaleDateString()}
                                                        </td>
                                                        <td>{q.customer_name}</td>
                                                        <td>₹{q.quotation_and_billing_master_total?.toFixed(2)}</td>
                                                        <td>
                                                            ₹{q.quotation_and_billing_master_gst_amount?.toFixed(2)}
                                                        </td>
                                                        <td>
                                                            ₹{q.quotation_and_billing_master_grand_total?.toFixed(2)}
                                                        </td>
                                                        <td>
                                                            <ul className="list-inline hstack gap-2 mb-0">
                                                                {canUpdate && (
                                                                    <li className="list-inline-item">
                                                                        <button
                                                                            className="text-primary border-0 bg-transparent p-0"
                                                                            onClick={() => {
                                                                                setSelectedQuotation(q);
                                                                                setIsUpdateOpen(true);
                                                                            }}
                                                                        >
                                                                            <i className="ri-pencil-fill fs-16"></i>
                                                                        </button>
                                                                    </li>
                                                                )}
                                                                {canDelete && (
                                                                    <li className="list-inline-item">
                                                                        <button
                                                                            className="text-danger border-0 bg-transparent p-0"
                                                                            onClick={() => onClickDelete(q)}
                                                                        >
                                                                            <i className="ri-delete-bin-5-fill fs-16"></i>
                                                                        </button>
                                                                    </li>
                                                                )}
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
                                                            <h5>Sorry! No Quotations Found</h5>
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

            {isAddOpen && (
                <QuotationAndBillingAdd
                    isOpen={isAddOpen}
                    toggle={() => setIsAddOpen(false)}
                />
            )}

            {isUpdateOpen && (
                <QuotationAndBillingUpdate
                    isOpen={isUpdateOpen}
                    toggle={() => setIsUpdateOpen(false)}
                    quotationData={selectedQuotation}
                />
            )}

            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default QuotationAndBillingList;
