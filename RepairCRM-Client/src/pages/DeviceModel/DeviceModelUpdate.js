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
} from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
  updateDeviceModel,
  resetUpdateDeviceModelResponse,
} from "../../store/DeviceModel";
import { getBrandsList } from "../../store/Brand";
import { getDeviceTypesList } from "../../store/DeviceType";
import BrandAdd from "../Brand/BrandAdd";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";

const DeviceModelUpdate = ({ isOpen, toggle, deviceData }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  // Redux state
  const { updateDeviceModelResponse } = useSelector(
    (state) => state.DeviceModelReducer
  );
  const { brands } = useSelector((state) => state.BrandReducer);
  const { deviceTypes } = useSelector((state) => state.DeviceTypeReducer);

  // Local state
  const [form, setForm] = useState({
    device_model_id: "",
    device_model_name: "",
    device_model_brand_id: null,
    device_model_device_id: null,
  });

  const [errors, setErrors] = useState({
    name: "",
    brand: "",
    device: "",
  });

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isDeviceTypeModalOpen, setIsDeviceTypeModalOpen] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    dispatch(getBrandsList());
    dispatch(getDeviceTypesList());
  }, [dispatch]);

  // Prefill form data
  useEffect(() => {
    if (deviceData) {
      setForm({
        device_model_id: deviceData.device_model_id || "",
        device_model_name: deviceData.device_model_name || "",
        device_model_brand_id: deviceData.device_model_brand_id || null,
        device_model_device_id: deviceData.device_model_device_id || null,
      });
    }
  }, [deviceData]);

  // Options
  const brandOptions =
    brands?.map((b) => ({ value: b.brand_id, label: b.brand_name })) || [];
  const deviceTypeOptions =
    deviceTypes?.map((d) => ({
      value: d.device_type_id,
      label: d.device_type_name,
    })) || [];

  // Handlers
  const handleInputChange = (e) => {
    setForm({ ...form, device_model_name: e.target.value });
    setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleBrandChange = (selected) => {
    setForm({ ...form, device_model_brand_id: selected ? selected.value : null });
    setErrors((prev) => ({ ...prev, brand: "" }));
  };

  const handleDeviceTypeChange = (selected) => {
    setForm({
      ...form,
      device_model_device_id: selected ? selected.value : null,
    });
    setErrors((prev) => ({ ...prev, device: "" }));
  };

  // Validation + Dispatch
  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { name: "", brand: "", device: "" };

    if (!form.device_model_name.trim()) {
      newErrors.name = "Device Model Name is required";
      valid = false;
    }
    if (!form.device_model_brand_id) {
      newErrors.brand = "Brand is required";
      valid = false;
    }
    if (!form.device_model_device_id) {
      newErrors.device = "Device Type is required";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    dispatch(updateDeviceModel(form));
  };

  // Success handling
  useEffect(() => {
    if (updateDeviceModelResponse) {
      toggle();
      dispatch(resetUpdateDeviceModelResponse());
    }
  }, [updateDeviceModelResponse, dispatch, toggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s")
        submitButtonRef.current?.click();
      if (event.altKey && event.key === "Escape") toggle();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Update Device Model</h4>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Device Model Name <span className="text-danger">*</span>
                    </div>
                    <div className="text-danger">{errors.name}</div>
                  </Label>
                  <input
                    name="device_model_name"
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="Enter device model name"
                    value={form.device_model_name}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>
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
                        (b) => b.value === form.device_model_brand_id
                      ) || null
                    }
                    onChange={handleBrandChange}
                    options={brandOptions}
                    placeholder="Select Brand"
                  />
                  {errors.brand && (
                    <div className="text-danger mt-1">{errors.brand}</div>
                  )}
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Label>
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
                        (d) => d.value === form.device_model_device_id
                      ) || null
                    }
                    onChange={handleDeviceTypeChange}
                    options={deviceTypeOptions}
                    placeholder="Select Device Type"
                  />
                  {errors.device && (
                    <div className="text-danger mt-1">{errors.device}</div>
                  )}
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button innerRef={submitButtonRef} color="primary" type="submit">
              Update
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer />

      {/* Nested Modals */}
      {isBrandModalOpen && (
        <BrandAdd
          isOpen={isBrandModalOpen}
          toggle={() => setIsBrandModalOpen(false)}
        />
      )}
      {isDeviceTypeModalOpen && (
        <DeviceTypeAdd
          isOpen={isDeviceTypeModalOpen}
          toggle={() => setIsDeviceTypeModalOpen(false)}
        />
      )}
    </>
  );
};

export default DeviceModelUpdate;
