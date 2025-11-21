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
  addDeviceType,
  resetAddDeviceTypeResponse,
} from "../../store/DeviceType/index";

const DeviceTypeAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addDeviceTypeResponse } = useSelector(
    (state) => state.DeviceTypeReducer
  );

  const [form, setForm] = useState({ device_type_name: "" });
  const [error, setError] = useState("");
  const submitRef = useRef();

  const handleInputChange = (e) => {
    setForm({ device_type_name: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    if (!form.device_type_name.trim()) {
      setError("Device Type is required");
      return;
    }
    dispatch(addDeviceType(form));
  };

  useEffect(() => {
    if (addDeviceTypeResponse) {
      toggle();
      setForm({ device_type_name: "" });
      dispatch(resetAddDeviceTypeResponse());
    }
  }, [addDeviceTypeResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Create Device Type</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col>
                  <Label className="d-flex justify-content-between">
                    <div>
                      Device Type <span className="text-danger">*</span>
                    </div>
                    {error && (
                      <div className="text-danger text-sm">{error}</div>
                    )}
                  </Label>
                  <Input
                    type="text"
                    name="device_type_name"
                    placeholder="Enter device type"
                    value={form.device_type_name}
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
            <Button color="danger" type="button" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default DeviceTypeAdd;
