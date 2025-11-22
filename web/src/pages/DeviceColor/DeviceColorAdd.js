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
  addDeviceColor,
  resetAddDeviceColorResponse,
} from "../../store/DeviceColor/index";

const DeviceColorAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addDeviceColorResponse } = useSelector(
    (state) => state.DeviceColorReducer
  );

  const [form, setForm] = useState({ device_color_name: "" });
  const [error, setError] = useState(false);
  const submitRef = useRef();

  const handleInputChange = (e) => {
    setForm({ device_color_name: e.target.value });
    setError(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.device_color_name.trim()) {
      setError(true);
      return;
    }
    dispatch(addDeviceColor(form));
  };

  useEffect(() => {
    if (addDeviceColorResponse) {
      toggle();
      setForm({ device_color_name: "" });
      dispatch(resetAddDeviceColorResponse());
    }
  }, [addDeviceColorResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Add Device Color</ModalHeader>
        <Form onSubmit={handleAdd}>
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
                    invalid={error && !form.device_color_name.trim()}
                  />
                  <FormFeedback>Device color is required</FormFeedback>
                </Col>
              </Row>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" ref={submitRef} type="submit">
              Save
            </Button>
            <Button color="danger" onClick={toggle} type="button">
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default DeviceColorAdd;
