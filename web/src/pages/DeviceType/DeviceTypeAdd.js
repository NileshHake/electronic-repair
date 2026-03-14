 
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

  const [form, setForm] = useState({
    device_type_name: "",
    carry_price_per_month: "",
    onsite_price_per_month: "",
    carry_price_per_year: "",
    onsite_price_per_year: "",
  });

  const [error, setError] = useState("");
  const submitRef = useRef();

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

    dispatch(addDeviceType(form));
  };

  useEffect(() => {
    if (addDeviceTypeResponse) {
      toggle();

      setForm({
        device_type_name: "",
        carry_price_per_month: "",
        onsite_price_per_month: "",
        carry_price_per_year: "",
        onsite_price_per_year: "",
      });

      dispatch(resetAddDeviceTypeResponse());
    }
  }, [addDeviceTypeResponse, dispatch, toggle]);

  return (
    <>
      <Modal size="lg" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle}>Create Device Type</ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="g-3">

                <Col md="12">
                  <Label>Device Type <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="device_type_name"
                    placeholder="Enter device type"
                    value={form.device_type_name}
                    onChange={handleInputChange}
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
 
