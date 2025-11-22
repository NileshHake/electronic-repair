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
  getDeviceColorList,
  deleteDeviceColor,
} from "../../store/DeviceColor/index";

import DeviceColorAdd from "./DeviceColorAdd";
import DeviceColorUpdate from "./DeviceColorUpdate";

const DeviceColorList = () => {
  const dispatch = useDispatch();
  const { deviceColors = [], loading } = useSelector(
    (state) => state.DeviceColorReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(getDeviceColorList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getDeviceColorList());
  };

  const onClickDelete = (color) => {
    setSelectedColor(color);
    setDeleteModal(true);
  };

  const handleDeleteDeviceColor = () => {
    if (selectedColor) {
      dispatch(deleteDeviceColor(selectedColor.device_color_id));
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
                    <h5 className="mb-0 fw-bold">Device Color List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Device Color
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
                        <th>Device Color</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && deviceColors.length > 0 ? (
                        deviceColors.map((color, index) => (
                          <tr key={color.device_color_id}>
                            <td>{index + 1}</td>
                            <td>{color.device_color_name}</td>
                            <td>
                              <button
                                className="text-primary border-0 bg-transparent me-2"
                                onClick={() => {
                                  setSelectedColor(color);
                                  setIsUpdateOpen(true);
                                }}
                              >
                                <i className="ri-pencil-fill fs-16"></i>
                              </button>
                              <button
                                className="text-danger border-0 bg-transparent"
                                onClick={() => onClickDelete(color)}
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
                              No Device Colors Found
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
        <DeviceColorAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}
      {isUpdateOpen && (
        <DeviceColorUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          deviceColorData={selectedColor}
        />
      )}

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteDeviceColor}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default DeviceColorList;
