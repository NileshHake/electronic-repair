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
  getStorageLocationsList,
  deleteStorageLocation,
} from "../../store/StorageLocation/index";

import StorageLocationAdd from "./StorageLocationAdd";
import StorageLocationUpdate from "./StorageLocationUpdate";

const StorageLocationList = () => {
  const dispatch = useDispatch();
  const { storageLocations, loading } = useSelector(
    (state) => state.StorageLocationReducer
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(getStorageLocationsList());
  }, [dispatch]);

  const handleModalClose = () => {
    setIsAddOpen(false);
    setIsUpdateOpen(false);
    dispatch(getStorageLocationsList());
  };

  const onClickDelete = (location) => {
    setSelectedLocation(location);
    setDeleteModal(true);
  };

  const handleDeleteStorageLocation = () => {
    if (selectedLocation) {
      dispatch(deleteStorageLocation(selectedLocation.storage_location_id));
    }
    setDeleteModal(false);
  };

  // Alt + A to open modal, Alt + C to close
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
                    <h5 className="mb-0 fw-bold">Storage Location List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Storage Location
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
                        <th>Storage Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && storageLocations.length > 0 ? (
                        storageLocations.map((location, index) => (
                          <tr key={location.storage_location_id}>
                            <td>{index + 1}</td>
                            <td>{location.storage_location_name}</td>
                            <td>
                              <button
                                className="text-primary border-0 bg-transparent me-2"
                                onClick={() => {
                                  setSelectedLocation(location);
                                  setIsUpdateOpen(true);
                                }}
                              >
                                <i className="ri-pencil-fill fs-16"></i>
                              </button>
                              <button
                                className="text-danger border-0 bg-transparent"
                                onClick={() => onClickDelete(location)}
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
                              No Storage Location Found
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
        <StorageLocationAdd isOpen={isAddOpen} toggle={handleModalClose} />
      )}

      {/* Update Modal */}
      {isUpdateOpen && (
        <StorageLocationUpdate
          isOpen={isUpdateOpen}
          toggle={handleModalClose}
          storageLocationData={selectedLocation}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteStorageLocation}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default StorageLocationList;
