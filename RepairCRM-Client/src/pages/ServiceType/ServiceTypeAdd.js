import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  Button,
  ModalFooter,
  Card,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { addServiceType } from "../../store/ServiceType/index";

const ServiceTypeAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const submitButtonRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Service Type Name is required");
      return;
    }

    dispatch(addServiceType({ service_type_name: name }));
    toggle();
    setName("");
    setError("");
  };

  // Keyboard shortcuts: Alt+S = Save, Alt+Esc = Close
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
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>Add Service Type</ModalHeader>

        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <div className="mb-3">
              <Label className="form-label fw-bold d-flex justify-content-between">
                <div>
                  Service Type Name <span className="text-danger">*</span>
                </div>
                <div className="text-danger">{error}</div>
              </Label>
              <Input
                type="text"
                placeholder="Enter service type name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            color="primary"
            type="submit"
            innerRef={submitButtonRef} // reactstrap uses innerRef
          >
            Save
          </Button>
          <Button type="button" color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ServiceTypeAdd;
