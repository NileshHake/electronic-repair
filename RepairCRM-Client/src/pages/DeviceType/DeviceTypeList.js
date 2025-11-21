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
  getDeviceTypesList,
  deleteDeviceType,
} from "../../store/DeviceType/index";

import DeviceTypeAdd from "./DeviceTypeAdd";
import DeviceTypeUpdate from "./DeviceTypeUpdate";

const DeviceTypeList = () => {
  const dispatch = useDispatch();
  const { deviceTypes, loading } = useSelector(
    (state) => state.DeviceTypeReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(getDeviceTypesList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getDeviceTypesList());
  };

  const onClickDelete = (device) => {
    setSelectedDevice(device);
    setDeleteModal(true);
  };

  const handleDeleteDeviceType = () => {
    if (selectedDevice) {
      dispatch(deleteDeviceType(selectedDevice.device_type_id));
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
                    <h5 className="mb-0 fw-bold">Device Type List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Device Type
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
                        <th>Device Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && deviceTypes.length > 0 ? (
                        deviceTypes.map((device, index) => (
                          <tr key={device.device_type_id}>
                            <td>{index + 1}</td>
                            <td>{device.device_type_name}</td>
                            <td>
                              <button
                                className="text-primary border-0 bg-transparent me-2"
                                onClick={() => {
                                  setSelectedDevice(device);
                                  setIsUpdateOpen(true);
                                }}
                              >
                                <i className="ri-pencil-fill fs-16"></i>
                              </button>
                              <button
                                className="text-danger border-0 bg-transparent"
                                onClick={() => onClickDelete(device)}
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
        <DeviceTypeAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}
      {isUpdateOpen && (
        <DeviceTypeUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          deviceTypeData={selectedDevice}
        />
      )}

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteDeviceType}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default DeviceTypeList;
