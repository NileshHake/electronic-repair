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

import DeleteModal from "../../Components/Common/DeleteModal";
import SupplierAdd from "./SupplierAdd";
import SupplierUpdate from "./SupplierUpdate";
import {
  deleteSupplier,
  getSuppliersList,
} from "../../store/Supplier";
import BusinessAdd from "../Business/BusinessAdd";
import BusinessUpdate from "../Business/BusinessUpdate";
import BusinessViewModal from "../Business/BusinessViewModal";

const SupplierList = () => {
  document.title = "Supplier List";

  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector(
    (state) => state.SupplierReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ✅ Fetch Suppliers
  useEffect(() => {
    dispatch(getSuppliersList());
  }, [dispatch]);

  // ✅ Close modals & refresh
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    setIsViewOpen(false);
    setSelectedSupplier(null);
    dispatch(getSuppliersList());
  };


  // ✅ Delete Supplier
  const onClickDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteModal(true);
  };

  const handleDeleteSupplier = () => {
    if (selectedSupplier) {
      dispatch(deleteSupplier(selectedSupplier.user_id));
    }
    setDeleteModal(false);
  };

  // ✅ Keyboard shortcuts
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

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Supplier List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Supplier
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "20%" }}>Name</th>
                        <th style={{ width: "25%" }}>Email</th>
                        <th style={{ width: "15%" }}>Phone</th> 
                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && suppliers && suppliers.length > 0 ? (
                        suppliers.map((supplier, index) => (
                          <tr key={supplier.user_id}>
                            <td>{index + 1}</td>
                            <td>{supplier.user_name}</td>
                            <td>{supplier.user_email}</td>
                            <td>{supplier.user_phone_number}</td> 

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedSupplier(supplier);
                                      setIsViewOpen(true);
                                    }}
                                    title="View"
                                  >
                                    <i className="ri-eye-fill fs-16"></i>
                                  </button>
                                </li>

                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedSupplier(supplier);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(supplier)}
                                    className="text-danger border-0 bg-transparent"
                                  >
                                    <i className="ri-delete-bin-5-fill fs-16"></i>
                                  </button>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <h6 className="mt-3 text-muted">
                              No Suppliers Found
                            </h6>
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
        <BusinessAdd isOpen={isAddOpen} toggle={handleModalClose} status={true} />
      )}

      {isUpdateOpen && (
        <BusinessUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          businessDataToEdit={selectedSupplier}
          status={true}
        />
      )}
      {isViewOpen && (
        <BusinessViewModal
          isOpen={isViewOpen}
          toggle={() => setIsViewOpen(false)}
          business={selectedSupplier}
          status={true}   // optional if you want label Supplier inside view
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteSupplier}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default SupplierList;
