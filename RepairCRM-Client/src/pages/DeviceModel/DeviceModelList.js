import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import DeleteModal from "../../Components/Common/DeleteModal";
import { getDeviceModelsList, deleteDeviceModel } from "../../store/DeviceModel/index";
import DeviceModelAdd from "./DeviceModelAdd";
import DeviceModelUpdate from "./DeviceModelUpdate";

const DeviceModelList = () => {
  const dispatch = useDispatch();
  const { deviceModels, loading } = useSelector((state) => state.DeviceModelReducer);
  const { brands } = useSelector((state) => state.BrandReducer); // get brands

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => { dispatch(getDeviceModelsList()); }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getDeviceModelsList());
  };

  const onClickDelete = (device) => { setSelectedDevice(device); setDeleteModal(true); };
  const handleDeleteDevice = () => { if (selectedDevice) dispatch(deleteDeviceModel(selectedDevice.device_model_id)); setDeleteModal(false); };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") setIsAddOpen(true);
      if (event.altKey && event.key.toLowerCase() === "c") setIsAddOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to get brand name
  const getBrandName = (brand_id) => {
    const brand = brands.find((b) => b.brand_id === brand_id);
    return brand ? brand.brand_name : "-";
  };

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={800} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm"><h5 className="mb-0 fw-bold">Device Models</h5></div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>+ Add Device Model</Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "35%" }}>Device Model Name</th>
                        <th style={{ width: "35%" }}>Brand</th>
                        <th style={{ width: "25%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && deviceModels.length > 0 ? (
                        deviceModels.map((device, index) => (
                          <tr key={device.device_model_id}>
                            <td>{index + 1}</td>
                            <td>{device.device_model_name}</td>
                            <td>{getBrandName(device.device_model_brand_id)}</td>
                            <td>
                              <ul className="list-inline hstack gap-2 mb-0">
                                <li className="list-inline-item">
                                  <button
                                    className="text-primary border-0 bg-transparent"
                                    onClick={() => { setSelectedDevice(device); setIsUpdateOpen(true); }}
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </button>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    onClick={() => onClickDelete(device)}
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
                          <td colSpan="4" className="text-center py-4">
                            <lord-icon
                              src="https://cdn.lordicon.com/msoeawqm.json"
                              trigger="loop"
                              colors="primary:#405189,secondary:#0ab39c"
                              style={{ width: "72px", height: "72px" }}
                            ></lord-icon>
                            <h6 className="mt-3 text-muted">No Device Models Found</h6>
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

      {/* Add & Update Modals */}
      {isAddOpen && <DeviceModelAdd isOpen={isAddOpen} toggle={handleModalClose} />}
      {isUpdateOpen && <DeviceModelUpdate isOpen={isUpdateOpen} toggle={handleModalClose} deviceData={selectedDevice} />}

      {/* Delete Modal */}
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteDevice} onCloseClick={() => setDeleteModal(false)} />
    </div>
  );
};

export default DeviceModelList;
