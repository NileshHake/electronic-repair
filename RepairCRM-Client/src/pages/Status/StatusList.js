import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Badge,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import DeleteModal from "../../Components/Common/DeleteModal";
import { deleteStatus, getStatusList } from "../../store/Status"; // ✅ your redux file for status

import StatusAdd from "./StatusAdd";
import StatusUpdate from "./StatusUpdate";

const StatusList = () => {
  document.title = "Status List";

  const dispatch = useDispatch();

  const { statuses, loading } = useSelector((state) => state.StatusReducer);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Fetch status list
  useEffect(() => {
    dispatch(getStatusList());
  }, [dispatch]);

  // ✅ Close modal and refresh data
  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getStatusList());
  };

  // ✅ Open delete modal
  const onClickDelete = (status) => {
    setSelectedStatus(status);
    setDeleteModal(true);
  };

  // ✅ Delete status
  const handleDeleteStatus = () => {
    if (selectedStatus) {
      dispatch(deleteStatus(selectedStatus.status_id));
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
                    <h5 className="mb-0 fw-bold">Status List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Status
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
                        <th style={{ width: "35%" }}>Status Name</th>
                        <th style={{ width: "20%" }}>Color</th>

                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && statuses && statuses.length > 0 ? (
                        statuses.map((status, index) => (
                          <tr key={status.status_id}>
                            <td>{index + 1}</td>
                            <td>{status.status_name}</td>
                            <td>
                              <Badge className={` ${status.status_color}`}>
                                {status.status_color}
                              </Badge>
                            </td>

                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedStatus(status);
                                      setIsUpdateOpen(true);
                                    }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(status)}
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
                          <td colSpan="5" className="text-center py-4">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <h6 className="mt-3 text-muted">
                              No Status Records Found
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

      {isAddOpen && <StatusAdd isOpen={isAddOpen} toggle={handleModalClose} />}

      {isUpdateOpen && (
        <StatusUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          statusData={selectedStatus}
        />
      )}

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteStatus}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default StatusList;
