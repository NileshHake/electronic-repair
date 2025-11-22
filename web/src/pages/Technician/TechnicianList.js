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
import TechnicianAdd from "./TechnicianAdd";
import TechnicianUpdate from "./TechnicianUpdate"; 
import { deleteTechnician, getTechniciansList } from "../../store/Technician";

const TechnicianList = () => {
  document.title = "Technician List";

  const dispatch = useDispatch();
  const { technicians, loading } = useSelector((state) => state.TechnicianReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch Technicians
  useEffect(() => {
    dispatch(getTechniciansList());
  }, [dispatch]);

  // ✅ Close modals and refresh list
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getTechniciansList());
  };

  // ✅ Delete technician
  const onClickDelete = (technician) => {
    setSelectedTechnician(technician);
    setDeleteModal(true);
  };

  const handleDeleteTechnician = () => {
    if (selectedTechnician) {
      dispatch(deleteTechnician(selectedTechnician.user_id));
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
        <ToastContainer closeButton={false} limit={1} autoClose={800} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Technician List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Technician
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
                        <th style={{ width: "15%" }}>Role</th>
                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && technicians && technicians.length > 0 ? (
                        technicians.map((technician, index) => (
                          <tr key={technician.user_id}>
                            <td>{index + 1}</td>
                            <td>{technician.user_name}</td>
                            <td>{technician.user_email}</td>
                            <td>{technician.user_phone_number}</td>
                            <td>{technician.user_role_name || "—"}</td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedTechnician(technician);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(technician)}
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
                            <h6 className="mt-3 text-muted">No Technicians Found</h6>
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
      {isAddOpen && <TechnicianAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <TechnicianUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          technicianDataToEdit={selectedTechnician}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteTechnician}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default TechnicianList;
