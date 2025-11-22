/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Button,
  Label,
  Input,
  Form,
  Card,
} from "reactstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkflowStageList,
  addWorkflowStage,
  updateWorkflowStage,
  deleteWorkflowStage,
  updateWorkflow,
  resetAddWorkflowResponse,
  resetUpdateWorkflowResponse,
} from "../../store/Workflow";
import DeleteModal from "../../Components/Common/DeleteModal";
import WorkflowUpdateStageFormModal from "./UpdateComponent/WorkflowUpdateStageFormModal";
import WorkflowUpdateStagesTable from "./UpdateComponent/WorkflowUpdateStagesTable";

const colorOptions = [
  { label: "Primary", value: "bg-primary" },
  { label: "Secondary", value: "bg-secondary" },
  { label: "Success", value: "bg-success" },
  { label: "Info", value: "bg-info" },
  { label: "Warning", value: "bg-warning" },
  { label: "Danger", value: "bg-danger" },
  { label: "Dark", value: "bg-dark" },
];

const WorkflowUpdateModal = ({ modalStates, setModalStates, editData }) => {
  const dispatch = useDispatch();
  const { workflowStages, addWorkflowResponse, updateWorkflowResponse } =
    useSelector((state) => state.WorkflowReducer);

  // ========= Top level =========
  const [workflowName, setWorkflowName] = useState(
    editData?.workflow_name || ""
  );

  // ========= Stages splitted =========
  const openStages =
    workflowStages?.filter((st) => st.workflow_close_stage == 0) || [];
  const closeStages =
    workflowStages?.filter((st) => st.workflow_close_stage == 1) || [];

  // ========= Stage modal + delete modal =========
  const [stageModal, setStageModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState(null);

  // open / close type
  const [stageType, setStageType] = useState("open"); // "open" | "close"

  // Stage form state (used by child modal)
  const [stageForm, setStageForm] = useState({
    workflow_child_id: null,
    workflow_stage_name: "",
    workflow_stage_color: "bg-success",
    workflow_close_stage: 0, // 0 = open, 1 = close
    workflow_stage_attachment: false,
    workflow_stage_otp: false,
  });

  // ========= on mount modal open, load stages =========
  useEffect(() => {
    if (modalStates && editData?.workflow_id) {
      dispatch(getWorkflowStageList(editData.workflow_id));
      setWorkflowName(editData?.workflow_name || "");
    }
  }, [modalStates]);

  // ========= Add / Edit Stage Clicks =========
  const handleAddOpenStageClick = () => {
    setStageType("open");
    setStageForm({
      workflow_child_id: null,
      workflow_stage_name: "",
      workflow_stage_color: "bg-success",
      workflow_close_stage: 0,
      workflow_stage_attachment: false,
      workflow_stage_otp: false,
    });
    setStageModal(true);
  };

  const handleAddCloseStageClick = () => {
    setStageType("close");
    setStageForm({
      workflow_child_id: null,
      workflow_stage_name: "",
      workflow_stage_color: "bg-danger",
      workflow_close_stage: 1,
      workflow_stage_attachment: false,
      workflow_stage_otp: false,
    });
    setStageModal(true);
  };

  const handleEditStage = (stage) => {
    setStageType(stage.workflow_close_stage === 1 ? "close" : "open");
    setStageForm({
      workflow_child_id: stage.workflow_child_id,
      workflow_stage_name: stage.workflow_stage_name,
      workflow_stage_color: stage.workflow_stage_color || "bg-success",
      workflow_close_stage: stage.workflow_close_stage,
      workflow_stage_attachment: !!stage.workflow_stage_attachment,
      workflow_stage_otp: !!stage.workflow_stage_otp,
    });
    setStageModal(true);
  };

  const handleDeleteStage = (stageId) => {
    setDeleteStageId(stageId);
    setDeleteModal(true);
  };

  // ========= Save Stage (from child modal) =========
  const handleSaveStage = (e) => {
    e.preventDefault();
    if (!stageForm.workflow_stage_name.trim()) {
      toast.warning("Please enter a stage name");
      return;
    }

    const payload = {
      workflow_master_id: editData.workflow_id,
      workflow_stage_name: stageForm.workflow_stage_name.trim(),
      workflow_stage_color: stageForm.workflow_stage_color,
      workflow_close_stage: stageForm.workflow_close_stage,
      workflow_stage_attachment: stageForm.workflow_stage_attachment ? 1 : 0,
      workflow_stage_otp: stageForm.workflow_stage_otp ? 1 : 0,
    };

    if (stageForm.workflow_child_id) {
      // update
      dispatch(
        updateWorkflowStage({
          ...payload,
          workflow_child_id: stageForm.workflow_child_id,
        })
      );
    } else {
      // add
      dispatch(addWorkflowStage(payload));
    }
  };

  const confirmDeleteStage = () => {
    if (!deleteStageId) return;
    dispatch(deleteWorkflowStage(deleteStageId));
  };

  // ========= Update Workflow Name =========
  const handleUpdateWorkflow = (e) => {
    e.preventDefault();
    if (!workflowName.trim()) {
      toast.warning("Please enter a workflow name");
      return;
    }

    dispatch(
      updateWorkflow({
        workflow_id: editData.workflow_id,
        workflow_name: workflowName.trim(),
      })
    );
  };

  // ========= Reset Stage Modal =========
  const resetStageModal = () => {
    setStageModal(false);
    setStageForm({
      workflow_child_id: null,
      workflow_stage_name: "",
      workflow_stage_color: "bg-success",
      workflow_close_stage: stageType === "close" ? 1 : 0,
      workflow_stage_attachment: false,
      workflow_stage_otp: false,
    });
  };

  // ========= Listen to API responses =========
  useEffect(() => {
    if (addWorkflowResponse === true) {
      // stage add / update success
      resetStageModal();
      setDeleteModal(false);
      setDeleteStageId(null);

      dispatch(getWorkflowStageList(editData.workflow_id));
      dispatch(resetAddWorkflowResponse());
    }

    if (updateWorkflowResponse === true) {
      setModalStates(false);
      dispatch(resetUpdateWorkflowResponse());
    }
  }, [addWorkflowResponse, updateWorkflowResponse]);

  return (
    <>
      {/* Delete Stage Confirmation */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={confirmDeleteStage}
        onCloseClick={() => setDeleteModal(false)}
      />

      {/* Main Workflow Update Modal */}
      <Modal
        isOpen={modalStates}
        toggle={() => setModalStates(!modalStates)}
        className="modal-lg"
        centered
      >
        <ModalHeader
          className="bg-light p-3"
          toggle={() => setModalStates(false)}
        >
          Update Work Flow
        </ModalHeader>

        <Form onSubmit={handleUpdateWorkflow}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col md={12} className="mb-3">
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Work Flow Name<span className="text-danger">*</span>
                    </div>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter workflow name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </Col>

                {/* STAGES TABLE (open + close) */}
                <WorkflowUpdateStagesTable
                  openStages={openStages}
                  closeStages={closeStages}
                  onAddOpenStage={handleAddOpenStageClick}
                  onAddCloseStage={handleAddCloseStageClick}
                  onEditStage={handleEditStage}
                  onDeleteStage={handleDeleteStage}
                />
              </Row>
            </Card>
            <div className="modal-footer">
              <Button color="primary" type="submit">
                <i className="ri-save-3-line me-1" /> Save
              </Button>
              <Button color="danger" onClick={() => setModalStates(false)}>
                <i className="ri-close-line me-1" /> Close
              </Button>
            </div>
          </ModalBody>
        </Form>
      </Modal>

      {/* Stage Add/Edit Modal */}
      <WorkflowUpdateStageFormModal
        isOpen={stageModal}
        toggle={resetStageModal}
        colorOptions={colorOptions}
        stageType={stageType}
        stageForm={stageForm}
        setStageForm={setStageForm}
        onSubmit={handleSaveStage}
      />
    </>
  );
};

export default WorkflowUpdateModal;
