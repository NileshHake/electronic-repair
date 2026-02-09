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
import { getRamsList, deleteRam } from "../../store/Ram/index";

import RamAdd from "./RamAdd";
import RamUpdate from "./RamUpdate";

const RamList = () => {
  document.title = "RAM List";

  const dispatch = useDispatch();
  const { rams, loading } = useSelector((state) => state.RamReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRam, setSelectedRam] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(getRamsList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getRamsList());
  };

  const onClickDelete = (ram) => {
    setSelectedRam(ram);
    setDeleteModal(true);
  };

  const handleDeleteRam = () => {
    if (selectedRam) {
      dispatch(deleteRam(selectedRam.ram_id));
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
                    <h5 className="mb-0 fw-bold">RAM List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add RAM
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
                        <th style={{ width: "60%" }}>RAM Name</th>
                        <th style={{ width: "35%" }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {!loading && rams && rams.length > 0 ? (
                        rams.map((ram, index) => (
                          <tr key={ram.ram_id}>
                            <td>{index + 1}</td>
                            <td>{ram.ram_name}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedRam(ram);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>

                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(ram)}
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
                            <h6 className="mt-3 text-muted">No RAM Found</h6>
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
      {isAddOpen && <RamAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <RamUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          ramData={selectedRam}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRam}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default RamList;
