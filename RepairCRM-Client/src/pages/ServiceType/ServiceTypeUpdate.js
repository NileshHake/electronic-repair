import React, { useState, useEffect } from "react";
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
import { updateServiceType } from "../../store/ServiceType/index";

const ServiceTypeUpdate = ({ isOpen, toggle, serviceTypeData }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Pre-fill input when serviceTypeData changes
  useEffect(() => {
    if (serviceTypeData && serviceTypeData.service_type_name) {
      setName(serviceTypeData.service_type_name);
      setError("");
    }
  }, [serviceTypeData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Service Type Name is required");
      return;
    }

    dispatch(
      updateServiceType({
        service_type_id: serviceTypeData.service_type_id,
        service_type_name: name,
      })
    );
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>Update Service Type</ModalHeader>

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
          <Button color="primary" type="submit">
            Update
          </Button>
          <Button type="button" color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ServiceTypeUpdate;
