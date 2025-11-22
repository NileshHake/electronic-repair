/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  Row,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import WorkflowAddModal from "./WorkflowAddModal";
import WorkflowUpdate from "./WorkflowUpdate";
import {
  deleteWorkflow,
  getWorkflowList,
  resetAddWorkflowResponse,
  resetUpdateWorkflowResponse,
} from "../../store/Workflow";

const WorkflowList = () => {
  const dispatch = useDispatch();
  const {
    workflows = [],
    loading,
    addWorkflowResponse,
    updateWorkflowResponse,
  } = useSelector((state) => state.WorkflowReducer); 

  const [modalAdd, setModalAdd] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch workflow list
  useEffect(() => {
    document.title = "Workflow | CRM";
    dispatch(getWorkflowList());
  }, []);

  // Close modals automatically on success
  useEffect(() => {
    if (addWorkflowResponse === true) {
      setModalAdd(false);
      dispatch(resetAddWorkflowResponse());
      dispatch(getWorkflowList());
    }
    if (updateWorkflowResponse) {
      setModalUpdate(false);
      dispatch(resetUpdateWorkflowResponse());
      dispatch(getWorkflowList());
    }
  }, [addWorkflowResponse, updateWorkflowResponse]);

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteWorkflow(deleteId));
      setDeleteModal(false);
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setModalAdd(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setModalAdd(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <Col sm="6">
                    <h5 className="card-title mb-0">Workflow List</h5>
                  </Col>
                  <Col sm="6" className="text-sm-end">
                    <button
                      className="btn fw-bold btn-success mt-3"
                      onClick={() => setModalAdd(true)}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add
                      Workflow
                    </button>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <Nav
                  className="nav-tabs nav-tabs-custom nav-success"
                  role="tablist"
                ></Nav>

                <table className="table table-hover align-middle">
                  <thead className="table-light text-muted text-uppercase">
                    <tr>
                      <th>#</th>
                      <th>Workflow Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : workflows.length > 0 ? (
                      workflows.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.workflow_name}</td>
                          <td>
                            <ul className="list-inline hstack gap-2 mb-0">
                              <li className="list-inline-item edit">
                                <button
                                  className="text-primary border-0 bg-transparent"
                                  onClick={() => {
                                    setSelectedWorkflow(item);
                                    setModalUpdate(true);
                                  }}
                                >
                                  <i className="ri-pencil-fill fs-16" />
                                </button>
                              </li>
                              <li className="list-inline-item">
                                <button
                                  className="text-danger border-0 bg-transparent"
                                  onClick={() => {
                                    setDeleteId(item.workflow_id);
                                    setDeleteModal(true);
                                  }}
                                >
                                  <i className="ri-delete-bin-5-fill fs-16" />
                                </button>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No Workflows Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Add Modal */}
                {modalAdd && (
                  <WorkflowAddModal
                    modalStates={modalAdd}
                    setModalStates={() => setModalAdd(false)}
                  />
                )}

                {/* Update Modal */}
                {modalUpdate && (
                  <WorkflowUpdate
                    modalStates={modalUpdate}
                    setModalStates={() => setModalUpdate(false)}
                    editData={selectedWorkflow}
                  />
                )}

                <ToastContainer closeButton={false} limit={1} autoClose={800} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WorkflowList;
