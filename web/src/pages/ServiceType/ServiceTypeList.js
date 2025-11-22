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

import DeleteModal from "../../Components/Common/DeleteModal";
import { ToastContainer } from "react-toastify";
import { deleteServiceType, getServiceTypeList } from "../../store/ServiceType/index";
import ServiceTypeAdd from "./ServiceTypeAdd";
import ServiceTypeUpdate from "./ServiceTypeUpdate";

const ServiceTypeList = () => {
  document.title = "Service Types";

  const dispatch = useDispatch();
  const { serviceTypes } = useSelector((state) => state.ServiceTypeReducer);

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [serviceTypeData, setServiceTypeData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  // Fetch list on mount
  useEffect(() => {
    dispatch(getServiceTypeList());
  }, [dispatch]);

  // Keyboard shortcuts: ALT + A to add, ALT + C to close add modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Delete handlers
  const onClickDelete = (serviceType) => {
    setSelectedServiceType(serviceType);
    setDeleteModal(true);
  };

  const handleDeleteServiceType = () => {
    if (selectedServiceType) {
      dispatch(deleteServiceType(selectedServiceType.service_type_id));
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
                    <h5 className="mb-0 fw-bold">Service Type List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsOpen(true)}>
                      + Add Service Type
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
                        <th style={{ width: "65%" }}>Service Type Name</th>
                        <th style={{ width: "30%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceTypes && serviceTypes.length > 0 ? (
                        serviceTypes.map((serviceType, index) => (
                          <tr key={serviceType.id}>
                            <td>{index + 1}</td>
                            <td>{serviceType.service_type_name}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setServiceTypeData(serviceType);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(serviceType)}
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
                          <td colSpan="3" className="text-center py-5">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <div className="mt-4">
                              <h5>Sorry! No Result Found</h5>
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

      {/* Add Modal */}
      {isOpen && <ServiceTypeAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <ServiceTypeUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          serviceTypeData={serviceTypeData}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteServiceType}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default ServiceTypeList;
