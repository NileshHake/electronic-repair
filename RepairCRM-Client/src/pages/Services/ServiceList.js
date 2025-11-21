import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import DeleteModal from "../../Components/Common/DeleteModal";
import { getServicesList, deleteService } from "../../store/Service/index";
import ServiceAdd from "./ServiceAdd";
import ServiceUpdate from "./ServiceUpdate";

const ServiceList = () => {
  document.title = "Service List";

  const dispatch = useDispatch();
  const { services, loading } = useSelector((state) => state.ServiceReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // Fetch services
  useEffect(() => {
    dispatch(getServicesList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getServicesList());
  };

  const onClickDelete = (service) => {
    setSelectedService(service);
    setDeleteModal(true);
  };

  const handleDeleteService = () => {
    if (selectedService) {
      dispatch(deleteService(selectedService.service_id));
    }
    setDeleteModal(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") setIsAddOpen(true);
      if (event.altKey && event.key.toLowerCase() === "c") setIsAddOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={800} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Service List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Service
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
                        <th style={{ width: "45%" }}>Service Name</th>
                        <th style={{ width: "25%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && services && services.length > 0 ? (
                        services.map((service, index) => (
                          <tr key={service.service_id}>
                            <td>{index + 1}</td>
                            <td>{service.service_name}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedService(service);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(service)}
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
                          <td colSpan="3" className="text-center py-4">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <h6 className="mt-3 text-muted">No Services Found</h6>
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

      {/* Add Modal */}
      {isAddOpen && <ServiceAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <ServiceUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          serviceData={selectedService}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteService}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default ServiceList;
