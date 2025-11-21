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
  addStorageLocation,
  resetAddStorageLocationResponse,
} from "../../store/StorageLocation/index";

const StorageLocationAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addStorageLocationResponse } = useSelector(
    (state) => state.StorageLocationReducer
  );

  const [form, setForm] = useState({ storage_location_name: "" });
  const [error, setError] = useState("");
  const submitRef = useRef();

  const handleInputChange = (e) => {
    setForm({ storage_location_name: e.target.value });
    if (error) setError("");
  };

  const handleAdd = () => {
    if (!form.storage_location_name.trim()) {
      setError("Storage Location name is required");
      return;
    }
    dispatch(addStorageLocation(form));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd();
  };

  useEffect(() => {
    if (addStorageLocationResponse) {
      toggle();
      setForm({ storage_location_name: "" });
      dispatch(resetAddStorageLocationResponse());
    }
  }, [addStorageLocationResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle}>Create Storage Location</ModalHeader>

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
                    placeholder="Enter storage location"
                    value={form.storage_location_name}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" type="submit" ref={submitRef}>
              Save
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

export default StorageLocationAdd;
