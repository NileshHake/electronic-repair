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
  FormFeedback,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  updateDeviceColor,
  resetUpdateDeviceColorResponse,
} from "../../store/DeviceColor/index";

const DeviceColorUpdate = ({ isOpen, toggle, deviceColorData }) => {
  const dispatch = useDispatch();
  const { updateDeviceColorResponse } = useSelector(
    (state) => state.DeviceColorReducer
  );

  const [form, setForm] = useState({
    device_color_id: "",
    device_color_name: "",
  });
  const [error, setError] = useState(false);
  const submitRef = useRef();

  // Prefill form when data is available
  useEffect(() => {
    if (deviceColorData) {
      setForm({
        device_color_id: deviceColorData.device_color_id,
        device_color_name: deviceColorData.device_color_name || "",
      });
    }
  }, [deviceColorData]);

  const handleInputChange = (e) => {
    setForm({ ...form, device_color_name: e.target.value });
    setError(false);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!form.device_color_name.trim()) {
      setError(true);
      return;
    }
    dispatch(updateDeviceColor(form));
  };

  // Reset after successful update
  useEffect(() => {
    if (updateDeviceColorResponse) {
      toggle();
      dispatch(resetUpdateDeviceColorResponse());
    }
  }, [updateDeviceColorResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Update Device Color</ModalHeader>
        <Form onSubmit={handleUpdate}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col>
                  <Label className="fw-bold">
                    Device Color <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="device_color_name"
                    placeholder="Enter device color"
                    value={form.device_color_name}
                    onChange={handleInputChange}
                    // invalid={error && !form.device_color_name.trim()}
                  />
                  <FormFeedback>Device color is required</FormFeedback>
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" ref={submitRef} type="submit">
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

export default DeviceColorUpdate;
