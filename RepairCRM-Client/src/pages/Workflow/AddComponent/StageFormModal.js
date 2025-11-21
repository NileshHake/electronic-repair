// StageFormModal.jsx
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

const StageFormModal = ({
  isOpen,
  toggle,
  isCloseStage, // true => Close Stage, false => Open Stage
  colorOptions,
  valid,
  setValid,
  stageFormState,
  setStageFormState,
  onSave, // ({ isClose, name, selectedColorOption, workflow_stage_attachment, workflow_stage_otp }) => void
}) => {
  const {
    stageName,
    closeStageName,
    selectedColor,
    workflow_stage_attachment,
    workflow_stage_otp,
  } = stageFormState;

  const handleStageNameChange = (e) => {
    setValid(0);
    setStageFormState((prev) => ({
      ...prev,
      stageName: e.target.value,
    }));
  };

  const handleCloseStageNameChange = (e) => {
    setValid(0);
    setStageFormState((prev) => ({
      ...prev,
      closeStageName: e.target.value,
    }));
  };

  const handleColorChange = (option) => {
    setStageFormState((prev) => ({
      ...prev,
      selectedColor: option,
    }));
  };

  const handleAttachmentToggle = (e) => {
    setStageFormState((prev) => ({
      ...prev,
      workflow_stage_attachment: e.target.checked,
    }));
  };

  const handleOtpToggle = (e) => {
    setStageFormState((prev) => ({
      ...prev,
      workflow_stage_otp: e.target.checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = isCloseStage ? closeStageName : stageName;

    onSave({
      isClose: isCloseStage,
      name,
      selectedColorOption: selectedColor,
      workflow_stage_attachment,
      workflow_stage_otp,
    });
  };

  const title = isCloseStage
    ? stageFormState.isCloseStageEditing
      ? "Edit Close Stage"
      : "Create Close Stage"
    : stageFormState.isEditing
    ? "Edit Open Stage"
    : "Create Open Stage";

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        {title}
      </ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Card className="border card-border-success p-3 shadow-lg">
            <Row>
              <Col lg={12}>
                <Label className="fw-bold d-flex justify-content-between">
                  <div>
                    Stage Name<span className="text-danger">*</span>
                  </div>
                  {valid === 1 && (
                    <span className="text-danger">Required!</span>
                  )}
                </Label>
                <Input
                  name="stage_name"
                  placeholder="Enter Stage Name"
                  value={isCloseStage ? closeStageName : stageName}
                  onChange={
                    isCloseStage
                      ? handleCloseStageNameChange
                      : handleStageNameChange
                  }
                />
              </Col>

              <Col lg={12} className="mt-3">
                <Label className="form-label fw-bold">Select Color</Label>
                <Select
                  name="status_color"
                  value={selectedColor}
                  onChange={handleColorChange}
                  options={colorOptions}
                  classNamePrefix="select"
                  placeholder="Choose color..."
                />
              </Col>

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
                <Label
                  className="form-check-label   mb-2"
                  htmlFor="otpSwitch"
                
                >
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
          <Button type="button" color="danger" onClick={toggle}>
            Close
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default StageFormModal;
