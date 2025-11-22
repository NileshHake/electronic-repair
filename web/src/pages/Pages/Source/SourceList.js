import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
 
import SourceAdd from "./SourceAdd";
import SourceUpdate from "./SourceUpdate";
import { deleteSource, getSourcesList } from "../../../store/Source";
import DeleteModal from "../../../Components/Common/DeleteModal";

const SourceList = () => {
  document.title = "Source List";

  const dispatch = useDispatch();
  const { sources, loading } = useSelector((state) => state.SourceReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // Fetch sources on mount
  useEffect(() => {
    dispatch(getSourcesList());
  }, [dispatch]);

  // Handle Add / Update modal close
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getSourcesList());
  };

  // Delete modal
  const onClickDelete = (source) => {
    setSelectedSource(source);
    setDeleteModal(true);
  };

  const handleDeleteSource = () => {
    if (selectedSource) {
      dispatch(deleteSource(selectedSource.source_id));
    }
    setDeleteModal(false);
  };

  // Keyboard shortcuts
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
                    <h5 className="mb-0 fw-bold">Source List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Source
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
                        <th style={{ width: "45%" }}>Source Name</th>
                        <th style={{ width: "25%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && sources && sources.length > 0 ? (
                        sources.map((source, index) => (
                          <tr key={source.source_id}>
                            <td>{index + 1}</td>
                            <td>{source.source_name}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedSource(source);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(source)}
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
                            <h6 className="mt-3 text-muted">No Sources Found</h6>
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
      {isAddOpen && <SourceAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <SourceUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          sourceData={selectedSource}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteSource}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default SourceList;
