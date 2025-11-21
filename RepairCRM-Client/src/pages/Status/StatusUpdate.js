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
  updateStatus,
  resetUpdateStatusResponse,
} from "../../store/Status"; // ✅ your redux actions
import Select from "react-select";

const StatusUpdate = ({ isOpen, toggle, statusData: editStatus }) => {
  const dispatch = useDispatch();
  const { updateStatusResponse } = useSelector((state) => state.StatusReducer);

  const [statusData, setStatusData] = useState({
    status_id: "",
    status_name: "",
    status_color: { label: "Primary", value: "bg-primary" },
  });
  const [statusError, setStatusError] = useState("");
  const submitButtonRef = useRef();

  // 🔹 Color options
  const colorOptions = [
    { label: "Primary", value: "bg-primary" },
    { label: "Secondary", value: "bg-secondary" },
    { label: "Success", value: "bg-success" },
    { label: "Info", value: "bg-info" },
    { label: "Warning", value: "bg-warning" },
    { label: "Danger", value: "bg-danger" },
    { label: "Dark", value: "bg-dark" },
  ];

  // ✅ Prefill data on open
  useEffect(() => {
    if (editStatus) {
      const selectedColor =
        colorOptions.find((opt) => opt.value === editStatus.status_color) ||
        { label: "Primary", value: "bg-primary" };

      setStatusData({
        status_id: editStatus.status_id || "",
        status_name: editStatus.status_name || "",
        status_color: selectedColor,
      });
    }
  }, [editStatus]);

  // ✅ Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
    if (name === "status_name") setStatusError("");
  };

  // ✅ Select color
  const handleColorChange = (selectedOption) => {
    setStatusData((prev) => ({ ...prev, status_color: selectedOption }));
  };

  // ✅ Submit update
  const handleUpdateStatus = () => {
    if (!statusData.status_name.trim()) {
      setStatusError("Status name is required");
      return;
    }

    const payload = {
      status_id: statusData.status_id,
      status_name: statusData.status_name,
      status_color: statusData.status_color.value,
    };

    dispatch(updateStatus(payload));
  };

  // ✅ After success
  useEffect(() => {
    if (updateStatusResponse) {
      toggle();
      dispatch(resetUpdateStatusResponse());
    }
  }, [updateStatusResponse, dispatch, toggle]);

  // ✅ Keyboard shortcuts
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
          <h4>Update Status</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
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
            onClick={handleUpdateStatus}
          >
            Update
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

export default StatusUpdate;
