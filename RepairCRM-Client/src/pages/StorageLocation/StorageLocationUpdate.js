import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Card,
  Row,
  Col,
  Input,
  Form,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  updateStorageLocation,
  resetUpdateStorageLocationResponse,
} from "../../store/StorageLocation/index";

const StorageLocationUpdate = ({ isOpen, toggle, storageLocationData }) => {
  const dispatch = useDispatch();
  const { updateStorageLocationResponse } = useSelector(
    (state) => state.StorageLocationReducer
  );

  const [form, setForm] = useState({
    storage_location_id: "",
    storage_location_name: "",
  });
  const [error, setError] = useState("");
  const submitRef = useRef();

  useEffect(() => {
    if (storageLocationData) {
      setForm({
        storage_location_id: storageLocationData.storage_location_id,
        storage_location_name:
          storageLocationData.storage_location_name || "",
      });
      setError("");
    }
  }, [storageLocationData]);

  const handleInputChange = (e) => {
    setForm({ ...form, storage_location_name: e.target.value });
    if (error) setError("");
  };

  const handleUpdate = () => {
    if (!form.storage_location_name.trim()) {
      setError("Storage Location is required");
      return;
    }
    dispatch(updateStorageLocation(form));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  useEffect(() => {
    if (updateStorageLocationResponse) {
      toggle();
      dispatch(resetUpdateStorageLocationResponse());
    }
  }, [updateStorageLocationResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle}>Update Storage Location</ModalHeader>

          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Storage Location <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{error}</div>
                  </Label>
                  <Input
                    type="text"
                    name="storage_location_name"
                    value={form.storage_location_name}
                    onChange={handleInputChange}
                    placeholder="Enter storage location"
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" type="submit" ref={submitRef}>
              Update
            </Button>
            <Button type="button" color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default StorageLocationUpdate;
