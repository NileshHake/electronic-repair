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
import HardwareConfigurationAdd from "./HardwareConfigurationAdd";
import HardwareConfigurationUpdate from "./HardwareConfigurationUpdate";

import AuthUser from "../../helpers/AuthType/AuthUser";
import {
  deleteHardwareConfiguration,
  getHardwareConfigurations,
  resetAddHardwareConfigurationResponse,
  resetUpdateHardwareConfigurationResponse,
} from "../../store/HardwareConfiguration";

const HardwareConfigurationList = () => {
  document.title = "Hardware Configuration List";
  const { permissions } = AuthUser();
  const dispatch = useDispatch();

  const {
    hardwareConfigurations = [],
    addHardwareConfigurationResponse = false,
    updateHardwareConfigurationResponse = false,
  } = useSelector((state) => state.HardwareConfigurationReducer || {});
  console.log(hardwareConfigurations);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // ✅ Initial fetch
  useEffect(() => {
    dispatch(getHardwareConfigurations());
  }, [dispatch]);

  // ✅ Refresh after add/update
  useEffect(() => {
    if (addHardwareConfigurationResponse) {
      dispatch(getHardwareConfigurations());
      dispatch(resetAddHardwareConfigurationResponse());
      setIsAddOpen(false);
    }
    if (updateHardwareConfigurationResponse) {
      dispatch(getHardwareConfigurations());
      dispatch(resetUpdateHardwareConfigurationResponse());
      setIsUpdateOpen(false);
    }
  }, [
    addHardwareConfigurationResponse,
    updateHardwareConfigurationResponse,
    dispatch,
  ]);

  // ✅ Delete
  const onClickDelete = (hardware) => {
    setSelectedHardware(hardware);
    setDeleteModal(true);
  };

  const handleDeleteHardwareConfiguration = () => {
    if (selectedHardware) {
      dispatch(
        deleteHardwareConfiguration(selectedHardware.hardware_configuration_id)
      );
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
                    <h5 className="mb-0 fw-bold">
                      Hardware Configuration List
                    </h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Configuration
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
                        <th>Processor</th>
                        <th>RAM</th>
                        <th>Hard Disk</th>
                        <th>SSD</th>
                        <th>Graphics Card</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hardwareConfigurations &&
                      hardwareConfigurations.length > 0 ? (
                        hardwareConfigurations.map((hardware, index) => {
                          return (
                            <tr
                              key={hardware.hardware_configuration_id || index}
                            >
                              <td>{index + 1}</td>
                              <td>
                                {hardware.hardware_configuration_processor}
                              </td>
                              <td>{hardware.hardware_configuration_ram}</td>
                              <td>
                                {hardware.hardware_configuration_hard_disk}
                              </td>
                              <td>{hardware.hardware_configuration_ssd}</td>
                              <td>
                                {hardware.hardware_configuration_graphics_card}
                              </td>
                              <td>
                                <ul className="list-inline hstack gap-2 mb-0">
                                  <li className="list-inline-item">
                                    <button
                                      className="text-primary border-0 bg-transparent"
                                      onClick={() => {
                                        setSelectedHardware(hardware);
                                        setIsUpdateOpen(true);
                                      }}
                                    >
                                      <i className="ri-pencil-fill fs-16"></i>
                                    </button>
                                  </li>
                                  <li className="list-inline-item">
                                    <button
                                      className="text-danger border-0 bg-transparent"
                                      onClick={() => onClickDelete(hardware)}
                                    >
                                      <i className="ri-delete-bin-5-fill fs-16"></i>
                                    </button>
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
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

      {/* ✅ Add Modal */}
      {isAddOpen && (
        <HardwareConfigurationAdd
          isOpen={isAddOpen}
          toggle={() => setIsAddOpen(false)}
        />
      )}

      {/* ✅ Update Modal */}
      {isUpdateOpen && (
        <HardwareConfigurationUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          hardwareDataToEdit={selectedHardware}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteHardwareConfiguration}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default HardwareConfigurationList;
