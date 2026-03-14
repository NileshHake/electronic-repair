 
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
import { number } from "prop-types";

const DeviceTypeUpdate = ({ isOpen, toggle, deviceTypeData }) => {
  const dispatch = useDispatch();

  const { updateDeviceTypeResponse } = useSelector(
    (state) => state.DeviceTypeReducer
  );

  const [form, setForm] = useState({
    device_type_id: "",
    device_type_name: "",
    carry_price_per_month: "",
    onsite_price_per_month: "",
    carry_price_per_year: "",
    onsite_price_per_year: "",
  });

  const [error, setError] = useState("");
  const submitRef = useRef();

  useEffect(() => {
    if (deviceTypeData) {
      setForm({
        device_type_id: deviceTypeData.device_type_id,
        device_type_name: deviceTypeData.device_type_name || "",
        carry_price_per_month: Number(deviceTypeData.carry_price_per_month) || "",
        onsite_price_per_month: Number(deviceTypeData.onsite_price_per_month) || "",
        carry_price_per_year: Number(deviceTypeData.carry_price_per_year) || "",
        onsite_price_per_year: Number(deviceTypeData.onsite_price_per_year) || "",
      });
    }
  }, [deviceTypeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

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
      <Modal size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Update Device Type</ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="g-3">

                <Col md="12">
                  <Label>Device Type <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="device_type_name"
                    value={form.device_type_name}
                    onChange={handleInputChange}
                    placeholder="Enter device type"
                  />
                </Col>

                <Col md="6">
                  <Label>Carry Price / Month</Label>
                  <Input
                    type="number"
                    name="carry_price_per_month"
                    value={form.carry_price_per_month}
                    onChange={handleInputChange}
                  />
                </Col>

                <Col md="6">
                  <Label>Onsite Price / Month</Label>
                  <Input
                    type="number"
                    name="onsite_price_per_month"
                    value={form.onsite_price_per_month}
                    onChange={handleInputChange}
                  />
                </Col>

                <Col md="6">
                  <Label>Carry Price / Year</Label>
                  <Input
                    type="number"
                    name="carry_price_per_year"
                    value={form.carry_price_per_year}
                    onChange={handleInputChange}
                  />
                </Col>

                <Col md="6">
                  <Label>Onsite Price / Year</Label>
                  <Input
                    type="number"
                    name="onsite_price_per_year"
                    value={form.onsite_price_per_year}
                    onChange={handleInputChange}
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
 