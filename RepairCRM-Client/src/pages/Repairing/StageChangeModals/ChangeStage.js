import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import StageTabContent from "./StageTabContent";
import AttachmentTabContent from "./AttachmentTabContent";
import OtpVerificationTabContent from "./OtpVerificationTabContent";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import {
  addStageRemark,
  resetAddStageRemarkResponse,
} from "../../../store/StageRemarkData";
import { getRepairList } from "../../../store/Repairing";

const ChangeStage = ({
  isOpen = false,
  toggle = () => {},
  workflowStages = [],
  isSelectedData,
}) => {
  const dispatch = useDispatch();

  // ⚙️ Redux state
  const { addStageRemarkResponse, loading: stageRemarkLoading } = useSelector(
    (state) => state.StageRemarkReducer || {}
  );

  const [selectedStage, setSelectedStage] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  // Remark & attachment state
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // images
  const [selectedVideo, setSelectedVideo] = useState(null); // single video
  const [otpVerified, setOtpVerified] = useState(false);

  // ---------- RESET ALL LOCAL STATE ----------
  const resetLocalState = () => {
    setSelectedStage(null);
    setActiveTab("1");
    setRemark("");
    setRemarkError("");
    setSelectedFiles([]);
    setSelectedVideo(null);
    setOtpVerified(false);
  };

  // Close handler: reset + call parent toggle
  const handleClose = () => {
    resetLocalState();
    toggle();
  };

  // Initialize selectedStage when modal opens or selected repair changes
  useEffect(() => {
    if (isOpen) {
      if (workflowStages.length && isSelectedData?.workflow_child_id) {
        const currentIndex = workflowStages.findIndex(
          (s) => s.workflow_child_id === isSelectedData.workflow_child_id
        );
        const nextStage =
          currentIndex >= 0 && currentIndex < workflowStages.length - 1
            ? workflowStages[currentIndex + 1]
            : workflowStages[currentIndex];
        setSelectedStage(nextStage || workflowStages[0]);
      } else if (workflowStages.length) {
        setSelectedStage(workflowStages[0]);
      } else {
        setSelectedStage(null);
      }

      // reset each time it opens
      setOtpVerified(false);
      setRemarkError("");
      setActiveTab("1");
    } else {
      // when modal is closed from parent, also clear data
      resetLocalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowStages, isSelectedData, isOpen]);

  // Auto-switch active tab if stage doesn't support that feature
  useEffect(() => {
    if (!selectedStage) return;

    if (activeTab === "2" && !selectedStage.workflow_stage_attachment) {
      setActiveTab(selectedStage.workflow_stage_otp ? "3" : "1");
    }

    if (activeTab === "3" && !selectedStage.workflow_stage_otp) {
      setActiveTab(selectedStage.workflow_stage_attachment ? "2" : "1");
    }
  }, [selectedStage, activeTab]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Handle image attachments
  const handleAcceptedFiles = (files) => {
    const mappedFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: (file.size / 1024).toFixed(2) + " KB",
      })
    );
    setSelectedFiles((prev) => [...prev, ...mappedFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle video (single)
  const handleAcceptedVideo = (files) => {
    const file = files[0];
    if (!file) return;
    const mapped = Object.assign(file, {
      preview: URL.createObjectURL(file),
      formattedSize: (file.size / 1024).toFixed(2) + " KB",
    });
    setSelectedVideo(mapped);
  };

  const removeVideo = () => setSelectedVideo(null);

  const handleOtpVerified = () => {
    setOtpVerified(true);
    toast.success("OTP verified successfully!");
  };

  // 🔄 Close modal when addStageRemarkResponse becomes true
  useEffect(() => {
    if (addStageRemarkResponse) {
      // success from API
      handleClose();
      // reset flag in Redux
      dispatch(getRepairList());
      dispatch(resetAddStageRemarkResponse());
    }
  }, [addStageRemarkResponse, dispatch]);

  // 🟢 Final submit
  const handleMoveRepair = () => {
    if (!remark.trim()) {
      setRemarkError("Remark is required.");
      setActiveTab("1");
      toast.error("Remark is required!");
      return;
    }

    if (
      selectedStage?.workflow_stage_attachment &&
      selectedFiles.length === 0 &&
      !selectedVideo
    ) {
      // you can decide: only images required OR images/video any one
      setRemarkError("");
      setActiveTab("2");
      toast.error("Please upload at least one attachment (image or video)!");
      return;
    }

    if (selectedStage?.workflow_stage_otp && !otpVerified) {
      setActiveTab("3");
      toast.error("Please verify OTP before moving repair!");
      return;
    }

    // All validations passed
    setRemarkError("");

    // Build FormData for backend
    const formData = new FormData();
    formData.append("stage_remark", remark);
    formData.append("stage_remark_repair_id", isSelectedData?.repair_id ?? "");
    formData.append("stage_remark_date", formatDateTime(new Date()));
    formData.append(
      "stage_remark_stage_past_id",
      isSelectedData?.repair_workflow_stage_id ?? ""
    );
    formData.append(
      "stage_remark_stage_next_id",
      selectedStage?.workflow_child_id ?? ""
    );

    // Multiple images: append as array
    selectedFiles.forEach((file, index) => {
      formData.append("stage_remark_img[]", file); // backend reads array
    });

    // Single video: optional
    if (selectedVideo) {
      formData.append("stage_remark_video", selectedVideo);
    }

    // Fire API (saga) – do NOT close modal here
    dispatch(addStageRemark(formData));
  };

  return (
    <>
      <ToastContainer />
      <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
        <ModalHeader toggle={handleClose} className="border-0 pb-0">
          <span className="fw-bold">Move Repair</span>
        </ModalHeader>
        <ModalBody className="pt-2">
          <Card className="border card-border-success shadow-lg">
            <Nav className="nav-tabs nav-tabs-custom nav-success pb-0 bg-light">
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  Stage Change
                </NavLink>
              </NavItem>

              {selectedStage?.workflow_stage_attachment && (
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => toggleTab("2")}
                  >
                    Attachment
                  </NavLink>
                </NavItem>
              )}

              {selectedStage?.workflow_stage_otp && (
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => toggleTab("3")}
                  >
                    OTP Verification
                  </NavLink>
                </NavItem>
              )}
            </Nav>

            <TabContent activeTab={activeTab}>
              <TabPane tabId="1" className="p-3">
                <StageTabContent
                  workflowStages={workflowStages}
                  selectedStage={selectedStage}
                  setSelectedStage={setSelectedStage}
                  isSelectedData={isSelectedData}
                  remark={remark}
                  setRemark={setRemark}
                  remarkError={remarkError}
                />
              </TabPane>

              <TabPane tabId="2" className="p-3">
                <AttachmentTabContent
                  selectedFiles={selectedFiles}
                  handleAcceptedFiles={handleAcceptedFiles}
                  removeFile={removeFile}
                  selectedVideo={selectedVideo}
                  handleAcceptedVideo={handleAcceptedVideo}
                  removeVideo={removeVideo}
                />
              </TabPane>

              <TabPane tabId="3" className="p-3">
                <OtpVerificationTabContent
                  isSelectedData={isSelectedData}
                  onConfirm={handleOtpVerified}
                />
                {otpVerified && (
                  <div className="text-success mt-2 fw-semibold">
                    OTP Verified Successfully!
                  </div>
                )}
              </TabPane>
            </TabContent>
          </Card>
        </ModalBody>

        <div className="modal-footer">
          <Button
            type="button"
            color="primary"
            onClick={handleMoveRepair}
            disabled={!selectedStage || stageRemarkLoading}
          >
            {stageRemarkLoading ? "Saving..." : "Move Repair"}
          </Button>
          <Button type="button" color="danger" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ChangeStage;
