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
import BusinessAdd from "./BusinessAdd";
import BusinessUpdate from "./BusinessUpdate"; import { deleteBusiness, getBusinessesList } from "../../store/Business";
import BusinessViewModal from "./BusinessViewModal";


const BusinessList = () => {
  document.title = "Business List";

  const dispatch = useDispatch();
  const { businesses, loading } = useSelector(
    (state) => state.BusinessReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ✅ Fetch Businesses
  useEffect(() => {
    dispatch(getBusinessesList());
  }, [dispatch]);

  // ✅ Close modals and refresh list
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getBusinessesList());
  };

  // ✅ Delete business
  const onClickDelete = (business) => {
    setSelectedBusiness(business);
    setDeleteModal(true);
  };

  const handleDeleteBusiness = () => {
    if (selectedBusiness) {
      dispatch(deleteBusiness(selectedBusiness.user_id));
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
                    <h5 className="mb-0 fw-bold">Business List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Business
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
                      {!loading && businesses && businesses.length > 0 ? (
                        businesses.map((business, index) => (
                          <tr key={business.user_id}>
                            <td>{index + 1}</td>
                            <td>{business.user_name}</td>
                            <td>{business.user_email}</td>
                            <td>{business.user_phone_number || "—"}</td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedBusiness(business);
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
                                      setSelectedBusiness(business);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(business)}
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
                            <h6 className="mt-3 text-muted">No Businesses Found</h6>
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

      {/* ✅ Add Modal */}
      {isAddOpen && <BusinessAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <BusinessUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          businessDataToEdit={selectedBusiness}
        />
      )}
      {isViewOpen && (
        <BusinessViewModal
          isOpen={isViewOpen}
          toggle={() => setIsViewOpen(false)}
          business={selectedBusiness}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteBusiness}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default BusinessList;
