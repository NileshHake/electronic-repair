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
  getRepairTypesList,
  deleteRepairType,
} from "../../store/RepairType/index";
import RepairTypeAdd from "./RepairTypeAdd";
import RepairTypeUpdate from "./RepairTypeUpdate";

const RepairTypeList = () => {
  const dispatch = useDispatch();
  const { repairTypes, loading } = useSelector(
    (state) => state.RepairTypeReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(getRepairTypesList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getRepairTypesList());
  };

  const onClickDelete = (repair) => {
    setSelectedRepair(repair);
    setDeleteModal(true);
  };

  const handleDeleteRepairType = () => {
    if (selectedRepair) {
      dispatch(deleteRepairType(selectedRepair.repair_type_id));
    }
    setDeleteModal(false);
  };
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
                    <h5 className="mb-0 fw-bold">Repair Type List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Repair Type
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th>Repair Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && repairTypes.length > 0 ? (
                        repairTypes.map((repair, index) => (
                          <tr key={repair.repair_type_id}>
                            <td>{index + 1}</td>
                            <td>{repair.repair_type_name}</td>
                            <td>
                              <button
                                className="text-primary border-0 bg-transparent me-2"
                                onClick={() => {
                                  setSelectedRepair(repair);
                                  setIsUpdateOpen(true);
                                }}
                              >
                                <i className="ri-pencil-fill fs-16"></i>
                              </button>
                              <button
                                className="text-danger border-0 bg-transparent"
                                onClick={() => onClickDelete(repair)}
                              >
                                <i className="ri-delete-bin-5-fill fs-16"></i>
                              </button>
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
                            <h6 className="mt-3 text-muted">
                              No Accessories Found
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
        <RepairTypeAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}
      {isUpdateOpen && (
        <RepairTypeUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          repairTypeData={selectedRepair}
        />
      )}

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRepairType}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default RepairTypeList;
