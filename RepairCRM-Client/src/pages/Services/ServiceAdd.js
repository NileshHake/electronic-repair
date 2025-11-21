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
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { addService, resetAddServiceResponse } from "../../store/Service/index";

const ServiceAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { addServiceResponse } = useSelector((state) => state.ServiceReducer);

  const [serviceData, setServiceData] = useState({
    service_name: "",
  });

  const [serviceError, setServiceError] = useState("");
  const submitButtonRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
    if (name === "service_name") setServiceError("");
  };

  const handleAddService = () => {
    if (!serviceData.service_name.trim()) {
      setServiceError("Service Name is required");
      return;
    }
    dispatch(addService(serviceData));
  };

  // 👉 Trigger save on Enter key inside the input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddService();
    }
  };

  // Close modal on success
  useEffect(() => {
    if (addServiceResponse) {
      toggle();
      setServiceData({ service_name: "" });
      dispatch(resetAddServiceResponse());
    }
  }, [addServiceResponse, dispatch, toggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggle]);

  return (
    <>
      <Modal size="md" isOpen={isOpen} centered>
        <ModalHeader toggle={toggle} className="bg-light">
          <h4>Create Service</h4>
        </ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col lg={12}>
                <Label className="form-label fw-bold d-flex justify-content-between">
                  <div>
                    Service Name <span className="text-danger">*</span>
                  </div>
                  <div className="text-danger">{serviceError}</div>
                </Label>
                <Input
                  name="service_name"
                  placeholder="Enter service name"
                  type="text"
                  value={serviceData.service_name}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown} // 👈 Enter handling
                />
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            ref={submitButtonRef}
            color="primary"
            onClick={handleAddService}
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

export default ServiceAdd;
