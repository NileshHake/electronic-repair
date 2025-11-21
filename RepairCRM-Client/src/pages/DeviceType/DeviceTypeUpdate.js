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
  updateDeviceType,
  resetUpdateDeviceTypeResponse,
} from "../../store/DeviceType/index";

const DeviceTypeUpdate = ({ isOpen, toggle, deviceTypeData }) => {
  const dispatch = useDispatch();
  const { updateDeviceTypeResponse } = useSelector(
    (state) => state.DeviceTypeReducer
  );

  const [form, setForm] = useState({
    device_type_id: "",
    device_type_name: "",
  });
  const [error, setError] = useState("");
  const submitRef = useRef();

  useEffect(() => {
    if (deviceTypeData) {
      setForm({
        device_type_id: deviceTypeData.device_type_id,
        device_type_name: deviceTypeData.device_type_name || "",
      });
    }
  }, [deviceTypeData]);

  const handleInputChange = (e) => {
    setForm({ ...form, device_type_name: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.device_type_name.trim()) {
      setError("Device Type is required");
      return;
    }
    dispatch(updateDeviceType(form));
  };

  useEffect(() => {
    if (updateDeviceTypeResponse) {
      toggle();
      dispatch(resetUpdateDeviceTypeResponse());
    }
  }, [updateDeviceTypeResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Update Device Type</ModalHeader>
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
                    value={form.device_type_name}
                    onChange={handleInputChange}
                    placeholder="Enter device type"
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" ref={submitRef}>
              Update
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

export default DeviceTypeUpdate;
