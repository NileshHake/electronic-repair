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
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addStatus,
  resetAddStatusResponse,
} from "../../store/Status"; // <-- your status store file
import Select from "react-select";

const StatusAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();

  const { addStatusResponse } = useSelector((state) => state.StatusReducer);

  const [statusData, setStatusData] = useState({
    status_name: "",
    status_color: { label: "Primary", value: "bg-primary" },
  });

  const [statusError, setStatusError] = useState("");
  const submitButtonRef = useRef();

  const colorOptions = [
    { label: "Primary", value: "bg-primary" },
    { label: "Secondary", value: "bg-secondary" },
    { label: "Success", value: "bg-success" },
    { label: "Info", value: "bg-info" },
    { label: "Warning", value: "bg-warning" },
    { label: "Danger", value: "bg-danger" },
    { label: "Dark", value: "bg-dark" },
  ];

  // Handle name input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
    if (name === "status_name") setStatusError("");
  };

  // Handle color select
  const handleColorChange = (selectedOption) => {
    setStatusData((prev) => ({ ...prev, status_color: selectedOption }));
  };

  // Submit handler
  const handleAddStatus = () => {
    if (!statusData.status_name.trim()) {
      setStatusError("Status Name is required");
      return;
    }

    const payload = {
      status_name: statusData.status_name,
      status_color: statusData.status_color.value,
    };

    dispatch(addStatus(payload));
  };

  // Reset after success
  useEffect(() => {
    if (addStatusResponse) {
      toggle();
      setStatusData({
        status_name: "",
        status_color: { label: "Primary", value: "bg-primary" },
      });
      dispatch(resetAddStatusResponse());
    }
  }, [addStatusResponse, dispatch, toggle]);

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
      <Modal id="showModal" size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Status</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            {/* Status Name */}
            <Row className="mb-3">
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Status Name <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{statusError}</div>
                </Label>
                <Input
                  name="status_name"
                  placeholder="Enter status name"
                  type="text"
                  value={statusData.status_name}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            {/* Status Color */}
            <Row>
              <Col lg={12}>
                <Label className="form-label fw-bold">Select Color</Label>
                <Select
                  name="status_color"
                  value={statusData.status_color}
                  onChange={handleColorChange}
                  options={colorOptions}
                  classNamePrefix="select"
                
                />
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            ref={submitButtonRef}
            color="primary"
            onClick={handleAddStatus}
          >
            Save
          </Button>
          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default StatusAdd;
