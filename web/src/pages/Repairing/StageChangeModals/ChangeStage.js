// ✅ src/pages/Repairing/StageChangeModals/ChangeStage.jsx
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

import StageTabContent from "./StageTabContent";
import AttachmentTabContent from "./AttachmentTabContent";
import OtpVerificationTabContent from "./OtpVerificationTabContent";
import { formatDateTime } from "../../../helpers/date_and_time_format";

const ChangeStage = ({
  isOpen = false,
  toggle = () => {},
  workflowStages = [],
  isSelectedData,

  /* ✅ REUSE SUPPORT (Repair + Recovery) */
  entityId = "", // repair_id OR recovery_id
  pastStageId = "", // repair_workflow_stage_id OR recovery_workflow_stage_id
  entityKey = "stage_remark_repair_id", // backend key for id
  moduleType = "repair", // "repair" | "recovery"

  onSubmit = () => {},
  onRefresh = () => {},
  success = false,
  resetSuccess = () => {},
  loading = false,
}) => { 
  
  const [selectedStage, setSelectedStage] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);

  const resetLocalState = () => {
    setSelectedStage(null);
    setActiveTab("1");
    setRemark("");
    setRemarkError("");
    setSelectedFiles([]);
    setSelectedVideo(null);
    setOtpVerified(false);
  };

  const handleClose = () => {
    resetLocalState();
    toggle();
  };

  useEffect(() => {
    if (isOpen) {
      if (workflowStages.length && isSelectedData?.workflow_child_id) {
        const currentIndex = workflowStages.findIndex(
          (s) => String(s.workflow_child_id) === String(isSelectedData.workflow_child_id)
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

      setOtpVerified(false);
      setRemarkError("");
      setActiveTab("1");
    } else {
      resetLocalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowStages, isSelectedData, isOpen]);

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

  const handleAcceptedFiles = (files) => {
    const mappedFiles = (files || []).map((file) =>
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

  const handleAcceptedVideo = (files) => {
    const file = files?.[0];
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

  useEffect(() => {
    if (success) {
      handleClose();
      onRefresh?.();
      resetSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const handleMove = () => {
    // Debug: remove later if you want
    // console.log("MOVE CLICK =>", { moduleType, entityKey, entityId, pastStageId, onSubmitType: typeof onSubmit });

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
      setRemarkError("");
      setActiveTab("2");
      toast.error("Please upload at least one attachment (image or video)!");
      return;
    }

    if (selectedStage?.workflow_stage_otp && !otpVerified) {
      setActiveTab("3");
      toast.error("Please verify OTP before moving!");
      return;
    }

    setRemarkError("");

    const formData = new FormData();
    formData.append("stage_remark", remark);

    // ✅ dynamic key
    formData.append(entityKey, entityId ?? "");

    // ✅ backend uses this to decide repair vs recovery
    formData.append("stage_remark_module", moduleType);

    formData.append("stage_remark_date", formatDateTime(new Date()));
    formData.append("stage_remark_stage_past_id", pastStageId ?? "");
    formData.append(
      "stage_remark_stage_next_id",
      selectedStage?.workflow_child_id ?? ""
    );

    selectedFiles.forEach((file) => {
      formData.append("stage_remark_img[]", file);
    });

    if (selectedVideo) {
      formData.append("stage_remark_video", selectedVideo);
    }

    // ✅ Dispatch/API call comes from wrapper
    onSubmit(formData);
  };

  return (
    <>
      <ToastContainer />
      <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
        <ModalHeader toggle={handleClose} className="border-0 pb-0">
          <span className="fw-bold">
            Move {moduleType === "recovery" ? "Recovery" : "Repair"}
          </span>
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
            onClick={handleMove}
            disabled={!selectedStage || loading}
          >
            {loading ? "Saving..." : "Move"}
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