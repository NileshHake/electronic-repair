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
  Input,
  Form,
  FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  updateHardwareConfiguration,
  resetUpdateHardwareConfigurationResponse,
} from "../../store/HardwareConfiguration";

const HardwareConfigurationUpdate = ({ isOpen, toggle, hardwareDataToEdit }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  const { updateHardwareConfigurationResponse } = useSelector(
    (state) => state.HardwareConfigurationReducer || {}
  );

  const [formData, setFormData] = useState({
    hardware_configuration_id: "",
    hardware_configuration_processor: "",
    hardware_configuration_ram: "",
    hardware_configuration_hard_disk: "",
    hardware_configuration_ssd: "",
    hardware_configuration_graphics_card: "",
  });

  const [errors, setErrors] = useState({});

  // Prefill data
  useEffect(() => {
    if (hardwareDataToEdit) {
      setFormData({
        hardware_configuration_id:
          hardwareDataToEdit.hardware_configuration_id || "",
        hardware_configuration_processor:
          hardwareDataToEdit.hardware_configuration_processor || "",
        hardware_configuration_ram:
          hardwareDataToEdit.hardware_configuration_ram || "",
        hardware_configuration_hard_disk:
          hardwareDataToEdit.hardware_configuration_hard_disk || "",
        hardware_configuration_ssd:
          hardwareDataToEdit.hardware_configuration_ssd || "",
        hardware_configuration_graphics_card:
          hardwareDataToEdit.hardware_configuration_graphics_card || "",
      });
      setErrors({});
    }
  }, [hardwareDataToEdit]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.hardware_configuration_processor.trim())
      newErrors.hardware_configuration_processor = "Processor is required";
    if (!formData.hardware_configuration_ram.trim())
      newErrors.hardware_configuration_ram = "RAM is required";

    // At least one of SSD or Hard Disk required
    if (
      !formData.hardware_configuration_ssd.trim() &&
      !formData.hardware_configuration_hard_disk.trim()
    ) {
      newErrors.hardware_configuration_ssd = "Enter either SSD or Hard Disk";
      newErrors.hardware_configuration_hard_disk = "Enter either SSD or Hard Disk";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(updateHardwareConfiguration(formData));
  };

  // Response handler
  useEffect(() => {
    if (updateHardwareConfigurationResponse?.success) {
      toast.success("Hardware Configuration updated successfully!");
      toggle();
      dispatch(resetUpdateHardwareConfigurationResponse());
    } else if (updateHardwareConfigurationResponse?.error) {
      toast.error("Failed to update Hardware Configuration!");
      dispatch(resetUpdateHardwareConfigurationResponse());
    }
  }, [updateHardwareConfigurationResponse, dispatch, toggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
      if (e.altKey && e.key === "Escape") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle} className="bg-light fw-bold p-3">
          Update Hardware Configuration
        </ModalHeader>

        <Form onSubmit={handleUpdate}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row className="gy-3">
                {/* Processor */}
                <Col lg={6}>
                  <Label className="fw-bold">
                    Processor <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="hardware_configuration_processor"
                    placeholder="Enter Processor Details"
                    value={formData.hardware_configuration_processor}
                    onChange={handleChange}
                    invalid={!!errors.hardware_configuration_processor}
                  />
                  <FormFeedback>{errors.hardware_configuration_processor}</FormFeedback>
                </Col>

                {/* RAM */}
                <Col lg={6}>
                  <Label className="fw-bold">
                    RAM <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="hardware_configuration_ram"
                    placeholder="Enter RAM Details"
                    value={formData.hardware_configuration_ram}
                    onChange={handleChange}
                    invalid={!!errors.hardware_configuration_ram}
                  />
                  <FormFeedback>{errors.hardware_configuration_ram}</FormFeedback>
                </Col>

                {/* Hard Disk */}
                <Col lg={6}>
                  <Label className="fw-bold">
                    Hard Disk <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="hardware_configuration_hard_disk"
                    placeholder="Enter Hard Disk Details"
                    value={formData.hardware_configuration_hard_disk}
                    onChange={handleChange}
                    invalid={!!errors.hardware_configuration_hard_disk}
                  />
                  <FormFeedback>{errors.hardware_configuration_hard_disk}</FormFeedback>
                </Col>

                {/* SSD */}
                <Col lg={6}>
                  <Label className="fw-bold">
                    SSD <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="hardware_configuration_ssd"
                    placeholder="Enter SSD Details"
                    value={formData.hardware_configuration_ssd}
                    onChange={handleChange}
                    invalid={!!errors.hardware_configuration_ssd}
                  />
                  <FormFeedback>{errors.hardware_configuration_ssd}</FormFeedback>
                </Col>

                {/* Graphics Card */}
                <Col lg={6}>
                  <Label className="fw-bold">
                    Graphics Card (Optional)
                  </Label>
                  <Input
                    type="text"
                    name="hardware_configuration_graphics_card"
                    placeholder="Enter Graphics Card Details"
                    value={formData.hardware_configuration_graphics_card}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              ref={submitButtonRef}
              type="submit"
              style={{ minWidth: "120px" }}
            >
              Update
            </Button>
            <Button color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default HardwareConfigurationUpdate;
