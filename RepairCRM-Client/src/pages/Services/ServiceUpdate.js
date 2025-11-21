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
import {
  updateService,
  resetUpdateServiceResponse,
} from "../../store/Service/index";

const ServiceUpdate = ({ isOpen, toggle, serviceData }) => {
  const dispatch = useDispatch();
  const { updateServiceResponse } = useSelector(
    (state) => state.ServiceReducer
  );

  const [service, setService] = useState({
    service_id: "",
    service_name: "",
  });

  const [serviceError, setServiceError] = useState("");
  const submitButtonRef = useRef();

  useEffect(() => {
    if (serviceData) {
      setService({
        service_id: serviceData.service_id,
        service_name: serviceData.service_name || "",
      });
    }
  }, [serviceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value }));
    if (name === "service_name") setServiceError("");
  };

  const handleUpdateService = () => {
    if (!service.service_name.trim()) {
      setServiceError("Service Name is required");
      return;
    }
    dispatch(updateService(service));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateService();
  };

  useEffect(() => {
    if (updateServiceResponse) {
      toggle();
      dispatch(resetUpdateServiceResponse());
    }
  }, [updateServiceResponse, dispatch, toggle]);

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
          <h4>Update Service</h4>
        </ModalHeader>

        {/* form wrapper */}
        <form onSubmit={handleSubmit}>
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
                    value={service.service_name}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button
              ref={submitButtonRef}
              color="primary"
              type="submit" // submit for Enter key
            >
              Update
            </Button>
            <Button type="button" color="danger" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default ServiceUpdate;
