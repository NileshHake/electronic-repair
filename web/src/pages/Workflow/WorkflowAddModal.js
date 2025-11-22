// WorkflowAddModal.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Row,
  Col,
  Button,
  Form,
  Input,
} from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import { addWorkflow, resetAddWorkflowResponse } from "../../store/Workflow";
import { useDispatch, useSelector } from "react-redux";
import StageFormModal from "./AddComponent/StageFormModal";
import WorkflowStagesTable from "./AddComponent/WorkflowStagesTable";

const colorOptions = [
  { label: "Primary", value: "bg-primary" },
  { label: "Secondary", value: "bg-secondary" },
  { label: "Success", value: "bg-success" },
  { label: "Info", value: "bg-info" },
  { label: "Warning", value: "bg-warning" },
  { label: "Danger", value: "bg-danger" },
  { label: "Dark", value: "bg-dark" },
];

const WorkflowAddModal = (props) => {
  const dispatch = useDispatch();
  const { addWorkflowResponse } = useSelector(
    (state) => state.WorkflowReducer
  );

  // stage modal (for add/edit stage)
  const [modalStage, setModalStage] = useState(false);

  const [workflow, setWorkflow] = useState({
    workflow_name: "",
    children: [],
    CloseStagechildren: [],
    CloseStagechildrenStatus: [],
    OpenStagechildrenStatus: [],
  });

  const [valid, setValid] = useState(0); // 0 = ok, 1 = stage required, 2 = workflow name required

  // 0 = open stage, 1 = close stage
  const [closeStage, setCloseStage] = useState(0);

  const [workFlowStages, setWorkFlowStages] = useState([]);
  const [workFlowCloseStages, setWorkFlowCloseStages] = useState([]);
  const [workFlowCloseStageStatus, setWorkFlowCloseStageStatus] = useState([]);
  const [workFlowOpenStageStatus, setWorkFlowOpenStageStatus] = useState([]);

  // for stage form modal (controlled from parent)
  const [stageFormState, setStageFormState] = useState({
    // editing flags
    isEditing: false, // open stage editing
    isCloseStageEditing: false, // close stage editing
    editIndex: null,

    // names
    stageName: "",
    closeStageName: "",

    // color option from react-select
    selectedColor: null,

    // switches
    workflow_stage_attachment: false,
    workflow_stage_otp: false,
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const submitButtonRef = useRef();

  // ========== FIXED CLOSE STAGES (Won/Lost) ==========
  const setFixedStage = () => {
    setWorkFlowCloseStages([
      {
        workflow_close_stages: "Won",
        workflow_child_status: 1,
        workflow_stage_color: "bg-success",
        workflow_stage_attachment: false,
        workflow_stage_otp: false,
      },
      {
        workflow_close_stages: "Lost",
        workflow_child_status: 0,
        workflow_stage_color: "bg-danger",
        workflow_stage_attachment: false,
        workflow_stage_otp: false,
      },
    ]);
  };

  // sync children arrays into workflow object
  useEffect(() => {
    setWorkflow((prev) => ({
      ...prev,
      children: workFlowStages,
      CloseStagechildren: workFlowCloseStages,
      CloseStagechildrenStatus: workFlowCloseStageStatus,
      OpenStagechildrenStatus: workFlowOpenStageStatus,
    }));
  }, [
    workFlowStages,
    workFlowCloseStages,
    workFlowCloseStageStatus,
    workFlowOpenStageStatus,
  ]);

  // when API success
  useEffect(() => {
    if (addWorkflowResponse === true) {
      dispatch(resetAddWorkflowResponse());
      // close main modal from parent
      props.setModalStates(false);
    }
  }, [addWorkflowResponse, dispatch, props]);

  // main modal open on parent trigger
  useEffect(() => {
    if (props.modalStates) {
      // reset data whenever modal opens
      setFixedStage();
      setWorkflow({
        workflow_name: "",
        children: [],
        CloseStagechildren: [],
        CloseStagechildrenStatus: [],
        OpenStagechildrenStatus: [],
      });
      setWorkFlowStages([]);
      setWorkFlowCloseStageStatus([]);
      setWorkFlowOpenStageStatus([]);
      setValid(0);
      setDeleteModal(false);
      setModalStage(false);
      resetStageForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.modalStates]);

  const resetStageForm = () => {
    setStageFormState({
      isEditing: false,
      isCloseStageEditing: false,
      editIndex: null,
      stageName: "",
      closeStageName: "",
      selectedColor: null,
      workflow_stage_attachment: false,
      workflow_stage_otp: false,
    });
    setValid(0);
  };

  const toggleModalStage = useCallback(() => {
    resetStageForm();
    setModalStage((prev) => !prev);
  }, []);

  // ====== Open Stage Add ======
  const handleAddOpenStageClick = () => {
    setCloseStage(0);
    resetStageForm();
    setModalStage(true);
  };

  // ====== Close Stage Add ======
  const handleAddCloseStageClick = () => {
    setCloseStage(1);
    resetStageForm();
    setModalStage(true);
  };

  // ====== Edit Open Stage ======
  const handleEditOpenStage = (index) => {
    const current = workFlowStages[index];
    const existingColorClass = current?.workflow_stage_color || "bg-primary";
    const existingColorOption = colorOptions.find(
      (opt) => opt.value === existingColorClass
    );

    setCloseStage(0);
    setStageFormState({
      isEditing: true,
      isCloseStageEditing: false,
      editIndex: index,
      stageName: current.workflow_stages,
      closeStageName: "",
      selectedColor: existingColorOption || null,
      workflow_stage_attachment: !!current.workflow_stage_attachment,
      workflow_stage_otp: !!current.workflow_stage_otp,
    });
    setModalStage(true);
  };

  // ====== Edit Close Stage ======
  const handleEditCloseStage = (index) => {
    const current = workFlowCloseStages[index];
    const existingColorClass = current?.workflow_stage_color || "bg-secondary";
    const existingColorOption = colorOptions.find(
      (opt) => opt.value === existingColorClass
    );

    setCloseStage(1);
    setStageFormState({
      isEditing: false,
      isCloseStageEditing: true,
      editIndex: index,
      stageName: "",
      closeStageName: current.workflow_close_stages,
      selectedColor: existingColorOption || null,
      workflow_stage_attachment: !!current.workflow_stage_attachment,
      workflow_stage_otp: !!current.workflow_stage_otp,
    });
    setModalStage(true);
  };

  // ====== Delete Stage ======
  const handleDeleteStageClick = (index, isClose) => {
    setCloseStage(isClose ? 1 : 0);
    setDeleteIndex(index);
    setDeleteModal(true);
  };

  const handleDeleteStageConfirm = () => {
    if (closeStage === 1) {
      setWorkFlowCloseStages((prev) =>
        prev.filter((_, i) => i !== deleteIndex)
      );
    } else {
      setWorkFlowStages((prev) => prev.filter((_, i) => i !== deleteIndex));
    }
    setDeleteModal(false);
  };

  // ====== Save Stage from StageFormModal (Add / Edit) ======
  const handleSaveStage = ({
    isClose,
    name,
    selectedColorOption,
    workflow_stage_attachment,
    workflow_stage_otp,
  }) => {
    if (!name.trim()) {
      setValid(1);
      return;
    }

    // ---------- CLOSE STAGE ----------
    if (isClose) {
      const color =
        selectedColorOption?.value ||
        (name.toLowerCase() === "won"
          ? "bg-success"
          : name.toLowerCase() === "lost"
          ? "bg-danger"
          : "bg-secondary");

      if (stageFormState.isCloseStageEditing) {
        setWorkFlowCloseStages((prev) =>
          prev.map((item, i) =>
            i === stageFormState.editIndex
              ? {
                  ...item,
                  workflow_close_stages: name.trim(),
                  workflow_stage_color: color,
                  workflow_stage_attachment,
                  workflow_stage_otp,
                }
              : item
          )
        );
        toast.success("Close Stage Updated Successfully");
      } else {
        setWorkFlowCloseStages((prev) => [
          ...prev,
          {
            workflow_close_stages: name.trim(),
            workflow_stage_color: color,
            workflow_stage_attachment,
            workflow_stage_otp,
          },
        ]);
      }
    } else {
      // ---------- OPEN STAGE ----------
      const color = selectedColorOption?.value || "bg-primary";

      if (stageFormState.isEditing) {
        setWorkFlowStages((prev) =>
          prev.map((item, i) =>
            i === stageFormState.editIndex
              ? {
                  ...item,
                  workflow_stages: name.trim(),
                  workflow_stage_color: color,
                  workflow_stage_attachment,
                  workflow_stage_otp,
                }
              : item
          )
        );
        toast.success("Stage Updated Successfully");
      } else {
        setWorkFlowStages((prev) => [
          ...prev,
          {
            workflow_stages: name.trim(),
            workflow_stage_color: color,
            workflow_stage_attachment,
            workflow_stage_otp,
          },
        ]);
      }
    }

    resetStageForm();
    setModalStage(false);
  };

  // ====== Submit Workflow ======
  const submitWorkflow = (e) => {
    e.preventDefault();
    if (workflow.workflow_name.trim() === "") {
      setValid(2);
      return;
    }

    dispatch(addWorkflow(workflow));
  };

  const closeMainModal = () => {
    props.setModalStates(false);
    setModalStage(false);
    setDeleteModal(false);
    resetStageForm();
  };

  // ====== Keyboard Shortcuts ======
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === "Escape") {
        event.preventDefault();
        props.setModalStates(false);
      }
      if (event.altKey && (event.key === "s" || event.key === "S")) {
        event.preventDefault();
        submitButtonRef.current?.click();
      }
      if (event.altKey && (event.key === "c" || event.key === "C")) {
        event.preventDefault();
        props.setModalStates(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props]);

  return (
    <div>
      {/* Delete modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteStageConfirm}
        onCloseClick={() => setDeleteModal(false)}
      />

      {/* Main Modal */}
      <Modal
        id="showModal"
        isOpen={props.modalStates}
        toggle={closeMainModal}
        className="modal-lg"
        centered
      >
        <ModalHeader className="bg-light p-3" toggle={closeMainModal}>
          Create Work Flow
        </ModalHeader>

        <Form onSubmit={submitWorkflow}>
          <ModalBody>
            <Card className="border card-border-success p-3 shadow-lg">
              <Row>
                <Col lg={12}>
                  <Label className="form-label fw-bold d-flex justify-content-between">
                    <div>
                      Work Flow Name<span className="text-danger">*</span>
                    </div>
                    {valid === 2 && (
                      <span className="text-danger">
                        Work Flow name is required!
                      </span>
                    )}
                  </Label>
                  <Input
                    name="workflow_name"
                    className="form-control fw-bold"
                    placeholder="Work Flow"
                    type="text"
                    value={workflow.workflow_name}
                    onChange={(e) =>
                      setWorkflow((prev) => ({
                        ...prev,
                        workflow_name: e.target.value,
                      }))
                    }
                  />
                </Col>

                <WorkflowStagesTable
                  workFlowStages={workFlowStages}
                  workFlowCloseStages={workFlowCloseStages}
                  onAddOpenStage={handleAddOpenStageClick}
                  onAddCloseStage={handleAddCloseStageClick}
                  onEditOpenStage={handleEditOpenStage}
                  onEditCloseStage={handleEditCloseStage}
                  onDeleteStage={handleDeleteStageClick}
                />
              </Row>
            </Card>
          </ModalBody>

          <div className="modal-footer">
            <Button ref={submitButtonRef} color="primary" type="submit">
              <i className="ri-save-3-line me-1" /> Save
            </Button>
            <Button color="danger" type="button" onClick={closeMainModal}>
              <i className="ri-close-line me-1" /> Close
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Stage Add/Edit Modal */}
      <StageFormModal
        isOpen={modalStage}
        toggle={toggleModalStage}
        isCloseStage={closeStage === 1}
        colorOptions={colorOptions}
        valid={valid}
        setValid={setValid}
        stageFormState={stageFormState}
        setStageFormState={setStageFormState}
        onSave={handleSaveStage}
      />

      <ToastContainer />
    </div>
  );
};

export default WorkflowAddModal;
