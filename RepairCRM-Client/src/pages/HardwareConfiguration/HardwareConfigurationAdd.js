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
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { addHardwareConfiguration } from "../../store/HardwareConfiguration";

const HardwareConfigurationAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const submitButtonRef = useRef();

  const [hardwareData, setHardwareData] = useState({
    hardware_configuration_processor: "",
    hardware_configuration_ram: "",
    hardware_configuration_hard_disk: "",
    hardware_configuration_ssd: "",
    hardware_configuration_graphics_card: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHardwareData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!hardwareData.hardware_configuration_processor.trim())
      newErrors.hardware_configuration_processor = "Processor is required";

    if (!hardwareData.hardware_configuration_ram.trim())
      newErrors.hardware_configuration_ram = "RAM is required";

    // ✅ Either SSD or Hard Disk must be provided
    if (
      !hardwareData.hardware_configuration_ssd.trim() &&
      !hardwareData.hardware_configuration_hard_disk.trim()
    ) {
      newErrors.hardware_configuration_ssd = "Enter either SSD or Hard Disk";
      newErrors.hardware_configuration_hard_disk = "Enter either SSD or Hard Disk";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(addHardwareConfiguration(hardwareData));
    toast.success("Hardware Configuration added successfully!");

    toggle();

    // Reset form
    setHardwareData({
      hardware_configuration_processor: "",
      hardware_configuration_ram: "",
      hardware_configuration_hard_disk: "",
      hardware_configuration_ssd: "",
      hardware_configuration_graphics_card: "",
    });
  };

  // ✅ Keyboard shortcuts
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
          Add Hardware Configuration
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
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
                    value={hardwareData.hardware_configuration_processor}
                    onChange={handleInputChange}
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
                    value={hardwareData.hardware_configuration_ram}
                    onChange={handleInputChange}
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
                    value={hardwareData.hardware_configuration_hard_disk}
                    onChange={handleInputChange}
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
                    value={hardwareData.hardware_configuration_ssd}
                    onChange={handleInputChange}
                    invalid={!!errors.hardware_configuration_ssd}
                  />
                  <FormFeedback>{errors.hardware_configuration_ssd}</FormFeedback>
                </Col>

                {/* Graphics Card (Optional) */}
                <Col lg={6}>
                  <Label className="fw-bold">Graphics Card (Optional)</Label>
                  <Input
                    type="text"
                    name="hardware_configuration_graphics_card"
                    placeholder="Enter Graphics Card Details"
                    value={hardwareData.hardware_configuration_graphics_card}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              type="submit"
              ref={submitButtonRef}
              style={{ minWidth: "120px" }}
            >
              Save
            </Button>
            <Button color="danger" type="button" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} autoClose={800} />
    </>
  );
};

export default HardwareConfigurationAdd;
