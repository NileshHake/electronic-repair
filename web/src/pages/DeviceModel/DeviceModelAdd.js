import React, { useEffect, useState, useRef } from "react";
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
  Form,
  Input,
  FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { ToastContainer } from "react-toastify";
import {
  addDeviceModel,
  resetAddDeviceModelResponse,
} from "../../store/DeviceModel";
import { getBrandsList } from "../../store/Brand";
import { getDeviceTypesList } from "../../store/DeviceType";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";
import BrandAdd from "../Brand/BrandAdd";

const DeviceModelAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  const { addDeviceModelResponse } = useSelector(
    (state) => state.DeviceModelReducer
  );
  const { brands } = useSelector((state) => state.BrandReducer);
  const { deviceTypes } = useSelector((state) => state.DeviceTypeReducer);

  const [deviceData, setDeviceData] = useState({
    device_model_name: "",
    device_model_brand_id: null,
    device_model_device_id: null,
  });

  const [errors, setErrors] = useState({
    name: false,
    brand: false,
    device: false,
  });

  const [isDeviceTypeModalOpen, setIsDeviceTypeModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Fetch brands and device types
  useEffect(() => {
    dispatch(getBrandsList());
    dispatch(getDeviceTypesList());
  }, [dispatch]);

  // Map dropdown options
  const brandOptions =
    brands?.map((b) => ({ value: b.brand_id, label: b.brand_name })) || [];
  const deviceTypeOptions =
    deviceTypes?.map((d) => ({
      value: d.device_type_id,
      label: d.device_type_name,
    })) || [];

  // Handle input change
  const handleInputChange = (e) => {
    setDeviceData({ ...deviceData, device_model_name: e.target.value });
    setErrors((prev) => ({ ...prev, name: false }));
  };

  const handleBrandChange = (selected) => {
    setDeviceData({
      ...deviceData,
      device_model_brand_id: selected ? selected.value : null,
    });
    setErrors((prev) => ({ ...prev, brand: false }));
  };

  const handleDeviceTypeChange = (selected) => {
    setDeviceData({
      ...deviceData,
      device_model_device_id: selected ? selected.value : null,
    });
    setErrors((prev) => ({ ...prev, device: false }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      name: !deviceData.device_model_name.trim(),
      brand: !deviceData.device_model_brand_id,
      device: !deviceData.device_model_device_id,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;
    dispatch(addDeviceModel(deviceData));
  };

  // Success handling
  useEffect(() => {
    if (addDeviceModelResponse) {
      toggle();
      setDeviceData({
        device_model_name: "",
        device_model_brand_id: null,
        device_model_device_id: null,
      });
      dispatch(resetAddDeviceModelResponse());
    }
  }, [addDeviceModelResponse, dispatch, toggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Add Device Model</h4>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold">
                    Device Model Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="device_model_name"
                    placeholder="Enter device model name"
                    value={deviceData.device_model_name}
                    onChange={handleInputChange}
                    invalid={errors.name}
                  />
                  <FormFeedback>Device model name is required</FormFeedback>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Label className="fw-bold">
                      Device Brand <span className="text-danger">*</span>
                    </Label>
                    <span
                      role="button"
                      onClick={() => setIsBrandModalOpen(true)}
                      className="text-success fw-bold me-2"
                      style={{
                        fontSize: "25px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      +
                    </span>
                  </div>
                  <Select
                    value={
                      brandOptions.find(
                        (b) => b.value === deviceData.device_model_brand_id
                      ) || null
                    }
                    onChange={handleBrandChange}
                    options={brandOptions}
                    placeholder="Select Brand"
                    classNamePrefix={errors.brand ? "is-invalid" : ""}
                  />
                  {errors.brand && (
                    <div className="text-danger mt-1">Brand is required</div>
                  )}
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Label className="fw-bold">
                      Device Type <span className="text-danger">*</span>
                    </Label>
                    <span
                      role="button"
                      onClick={() => setIsDeviceTypeModalOpen(true)}
                      className="text-success fw-bold me-2"
                      style={{
                        fontSize: "25px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      +
                    </span>
                  </div>
                  <Select
                    value={
                      deviceTypeOptions.find(
                        (d) => d.value === deviceData.device_model_device_id
                      ) || null
                    }
                    onChange={handleDeviceTypeChange}
                    options={deviceTypeOptions}
                    placeholder="Select Device Type"
                    classNamePrefix={errors.device ? "is-invalid" : ""}
                  />
                  {errors.device && (
                    <div className="text-danger mt-1">
                      Device Type is required
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" ref={submitButtonRef} type="submit">
              Save
            </Button>
            <Button color="danger" type="button" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer />
      {isDeviceTypeModalOpen && (
        <DeviceTypeAdd
          isOpen={isDeviceTypeModalOpen}
          toggle={() => setIsDeviceTypeModalOpen(false)}
        />
      )}
      {isBrandModalOpen && (
        <BrandAdd
          isOpen={isBrandModalOpen}
          toggle={() => setIsBrandModalOpen(false)}
        />
      )}
    </>
  );
};

export default DeviceModelAdd;
