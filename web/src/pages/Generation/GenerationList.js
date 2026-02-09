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
import {
  getGenerationsList,
  deleteGeneration,
} from "../../store/Generation/index";

import GenerationAdd from "./GenerationAdd";
import GenerationUpdate from "./GenerationUpdate";

const GenerationList = () => {
  document.title = "Generation List";

  const dispatch = useDispatch();
  const { generations, loading } = useSelector(
    (state) => state.GenerationReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // Fetch generations
  useEffect(() => {
    dispatch(getGenerationsList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getGenerationsList());
  };

  const onClickDelete = (gen) => {
    setSelectedGeneration(gen);
    setDeleteModal(true);
  };

  const handleDeleteGeneration = () => {
    if (selectedGeneration) {
      dispatch(deleteGeneration(selectedGeneration.generations_id));
    }
    setDeleteModal(false);
  };

  // brand text
  const brandText = (brand) => {
    const b = Number(brand);
    if (b === 1) return "Intel";
    if (b === 2) return "AMD";
    return "-";
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
                    <h5 className="mb-0 fw-bold">Generation List</h5>
                  </div>

                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Generation
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
                        <th style={{ width: "45%" }}>Generation Name</th>
                        <th style={{ width: "25%" }}>Brand</th>
                        <th style={{ width: "25%" }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {!loading && generations && generations.length > 0 ? (
                        generations.map((gen, index) => (
                          <tr key={gen.generations_id}>
                            <td>{index + 1}</td>
                            <td>{gen.generations_name}</td>
                            <td>{brandText(gen.generations_brand)}</td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedGeneration(gen);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>

                              
                              { index >= 20 &&   <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(gen)}
                                    className="text-danger border-0 bg-transparent"
                                  >
                                    <i className="ri-delete-bin-5-fill fs-16"></i>
                                  </button>
                                </li>}
                              </ul>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <h6 className="mt-3 text-muted">
                              No Generations Found
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

      {/* Add Modal */}
      {isAddOpen && (
        <GenerationAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}

      {/* Update Modal */}
      {isUpdateOpen && (
        <GenerationUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          generationData={selectedGeneration}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteGeneration}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default GenerationList;
