// WorkflowUpdateStageFormModal.jsx
import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Card,
  Row,
  Col,
  Label,
  Input,
  Button,
  Form,
} from "reactstrap";
import Select from "react-select";

const WorkflowUpdateStageFormModal = ({
  isOpen,
  toggle,
  colorOptions,
  stageType, // "open" | "close"
  stageForm,
  setStageForm,
  onSubmit, // handleSaveStage
}) => {
  const {
    workflow_child_id,
    workflow_stage_name,
    workflow_stage_color,
    workflow_stage_attachment,
    workflow_stage_otp,
  } = stageForm;

  const handleNameChange = (e) => {
    setStageForm((prev) => ({
      ...prev,
      workflow_stage_name: e.target.value,
    }));
  };

  const handleColorChange = (option) => {
    setStageForm((prev) => ({
      ...prev,
      workflow_stage_color: option?.value || "bg-success",
    }));
  };

  const handleAttachmentToggle = (e) => {
    setStageForm((prev) => ({
      ...prev,
      workflow_stage_attachment: e.target.checked,
    }));
  };

  const handleOtpToggle = (e) => {
    setStageForm((prev) => ({
      ...prev,
      workflow_stage_otp: e.target.checked,
    }));
  };

  const title = `${workflow_child_id ? "Edit" : "Add"} ${
    stageType === "close" ? "Close" : "Open"
  } Stage`;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <Form onSubmit={onSubmit}>
        <ModalHeader className="bg-light p-3" toggle={toggle}>
          {title}
        </ModalHeader>
        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col md={12} className="mb-3">
                <Label className="fw-bold">
                  Stage Name <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter stage name"
                  value={workflow_stage_name}
                  onChange={handleNameChange}
                />
              </Col>

              <Col lg={12} className="mt-3">
                <Label className="form-label fw-bold">Select Color</Label>
                <Select
                  name="status_color"
                  value={colorOptions.find(
                    (option) => option.value === workflow_stage_color
                  )}
                  onChange={handleColorChange}
                  options={colorOptions}
                  classNamePrefix="select"
                  placeholder="Choose color..."
                />
              </Col>

              {/* Switch: Attachment */}

              <Col
                lg={6}
                className="mt-4 d-flex flex-column align-items-center"
              >
                <Label
                  className="form-check-label   mb-2"
                  htmlFor="attachmentSwitch"
                >
                  Attachment Required?
                </Label>
                <div
                  className="form-check form-switch d-flex justify-content-center"
                  style={{ transform: "scale(1.4)" }} // make switch bigger
                >
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="attachmentSwitch"
                    checked={!!workflow_stage_attachment}
                    onChange={handleAttachmentToggle}
                  />
                </div>
              </Col>

              {/* Switch for OTP */}
              <Col
                lg={6}
                className="mt-4 d-flex flex-column align-items-center"
              >
                <Label className="form-check-label   mb-2" htmlFor="otpSwitch">
                  OTP Verification?
                </Label>
                <div
                  className="form-check form-switch d-flex justify-content-center"
                  style={{ transform: "scale(1.4)" }}
                >
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="otpSwitch"
                    checked={!!workflow_stage_otp}
                    onChange={handleOtpToggle}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </ModalBody>

        <div className="modal-footer">
          <Button type="submit" color="primary">
            Save
          </Button>
          <Button color="danger" type="button" onClick={toggle}>
            Close
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkflowUpdateStageFormModal;
