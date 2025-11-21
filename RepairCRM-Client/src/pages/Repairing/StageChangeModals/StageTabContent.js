import React from "react";
import { Row, Col, Label, FormFeedback } from "reactstrap";
import { getTextColorClass } from "../../../helpers/date_and_time_format";

const StageTabContent = ({
  workflowStages,
  selectedStage,
  setSelectedStage,
  isSelectedData,
  remark,
  setRemark,
  remarkError,
}) => {
  const currentStageName = isSelectedData?.workflow_stage_name || "Current";
  const currentStageColorClass = isSelectedData?.workflow_stage_color || "btn-primary";
  const currentStageTextColor = getTextColorClass(currentStageColorClass);

  const nextStageName = selectedStage?.workflow_stage_name || "Select Stage";
  const nextStageColorClass = selectedStage?.workflow_stage_color || "btn-outline-danger";
  const nextStageTextColor = getTextColorClass(nextStageColorClass);

  return (
    <Row>
      <Col lg={12} className="d-flex justify-content-center align-items-center flex-column">
        {/* Stage chips */}
        <div className="mb-4">
          <h6 className="text-center text-muted mb-2">Select Workflow Stage</h6>
          <div className="d-flex flex-wrap justify-content-center gap-2 p-3 rounded-3 bg-light">
            {workflowStages.map((data, index) => {
              const btnColorClass = data.workflow_stage_color || "btn-outline-secondary";
              const textColorClass = getTextColorClass(btnColorClass);
              const isActive = selectedStage?.workflow_child_id === data.workflow_child_id;

              return (
                <div key={index} className="text-center">
                  <input
                    type="radio"
                    className="btn-check"
                    name="workflowStages"
                    id={`option-${index}`}
                    autoComplete="off"
                    checked={isActive}
                    onChange={() => setSelectedStage(data)}
                  />
                  <label
                    htmlFor={`option-${index}`}
                    className={`btn btn-sm rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm
                    ${btnColorClass} ${textColorClass} ${isActive ? "border border-2 border-dark" : "border-0"}`}
                    style={{ minWidth: "110px", fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap" }}
                  >
                    <span
                      className="rounded-circle bg-white bg-opacity-25 d-inline-flex align-items-center justify-content-center"
                      style={{ width: "18px", height: "18px" }}
                    >
                      <i
                        className={isActive ? "ri-check-line" : "ri-checkbox-blank-circle-line"}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </span>
                    <span>{data.workflow_stage_name}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage info */}
        <Row className="justify-content-center align-items-center w-100 py-3 border rounded-3 bg-light">
          <Col md={4} className="text-center mb-3 mb-md-0">
            <div className="mb-2">
              <div className="small text-muted text-uppercase mb-1">Current</div>
              <h5 className="fw-bold text-primary mb-3">Current Stage</h5>
              <div>
                <input type="radio" className="btn-check" name="selectedStage" autoComplete="off" />
                <label
                  className={`btn rounded-pill btn-sm px-4 py-2 fw-bold shadow-sm ${currentStageColorClass} ${currentStageTextColor}`}
                >
                  {currentStageName}
                </label>
              </div>
            </div>
          </Col>

          <Col md={4} className="text-center mb-3 mb-md-0">
            <div className="small text-muted text-uppercase mb-1">Transition</div>
            <h4 className="fw-bold text-dark mb-0">Move To</h4>
            <div className="mt-1 small text-muted">Select the next stage for this repair</div>
          </Col>

          <Col md={4} className="text-center">
            <div className="mb-2">
              <div className="small text-muted text-uppercase mb-1">Next</div>
              <h5 className="fw-bold text-danger mb-3">Next Stage</h5>
              <div>
                <input type="radio" className="btn-check" name="nextStage" autoComplete="off" />
                <label
                  className={`btn rounded-pill btn-sm px-4 py-2 fw-bold shadow-sm ${nextStageColorClass} ${nextStageTextColor}`}
                >
                  {nextStageName}
                </label>
              </div>
            </div>
          </Col>
        </Row>

        {/* Remark with validation message */}
        <Col lg={12} className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Label className="form-label fw-bold mb-0">
              Remark<span className="text-danger"> *</span>
            </Label>
            <small className="text-muted">Add a note for this stage change</small>
          </div>
          <textarea
            className={`form-control ${remarkError ? "is-invalid" : ""}`}
            rows="4"
            placeholder="Type your remark here..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          {remarkError && <div className="invalid-feedback">{remarkError}</div>}
        </Col>
      </Col>
    </Row>
  );
};

export default StageTabContent;
