// WorkflowUpdateStagesTable.jsx
import React from "react";
import { Col, Button } from "reactstrap";

const renderBool = (val) => (val ? "On" : "Off");

const WorkflowUpdateStagesTable = ({
  openStages,
  closeStages,
  onAddOpenStage,
  onAddCloseStage,
  onEditStage,
  onDeleteStage,
}) => {
  return (
    <>
      {/* ---------- Open Stages ---------- */}
      <Col md={12}>
        <div className="d-flex justify-content-between">
          <div className="fw-bold">Open Stages</div>
          <Button color="success" onClick={onAddOpenStage}>
            +
          </Button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover text-center mt-2">
            <thead className="table-light text-uppercase">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th>Stage Name</th>
                <th style={{ width: "15%" }}>Color</th>
                <th style={{ width: "10%" }}>Attachment</th>
                <th style={{ width: "10%" }}>OTP</th>
                <th style={{ width: "15%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {openStages.length > 0 ? (
                openStages.map((stage, index) => (
                  <tr key={stage.workflow_child_id}>
                    <td>{index + 1}</td>
                    <td>{stage.workflow_stage_name}</td>
                    <td>
                      <span
                        className={`badge ${stage.workflow_stage_color} px-3 py-2`}
                      >
                        {stage.workflow_stage_color.replace("bg-", "")}
                      </span>
                    </td>
                    <td>{renderBool(stage.workflow_stage_attachment)}</td>
                    <td>{renderBool(stage.workflow_stage_otp)}</td>
                    <td>
                      <button
                        type="button"
                        className="text-primary border-0 bg-transparent"
                        onClick={() => onEditStage(stage)}
                      >
                        <i className="ri-pencil-fill fs-16" />
                      </button>
                      <button
                        type="button"
                        className="text-danger border-0 bg-transparent"
                        onClick={() => onDeleteStage(stage.workflow_child_id)}
                      >
                        <i className="ri-delete-bin-5-fill fs-16" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No open stages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Col>

      {/* ---------- Close Stages ---------- */}
      <Col md={12} className="mt-4">
        <div className="d-flex justify-content-between">
          <div className="fw-bold">Close Stages</div>
          <Button color="success" onClick={onAddCloseStage}>
            +
          </Button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover text-center mt-2">
            <thead className="table-light text-uppercase">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th>Stage Name</th>
                <th style={{ width: "15%" }}>Color</th>
                <th style={{ width: "10%" }}>Attachment</th>
                <th style={{ width: "10%" }}>OTP</th>
                <th style={{ width: "15%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {closeStages.length > 0 ? (
                closeStages.map((stage, index) => (
                  <tr key={stage.workflow_child_id}>
                    <td>{index + 1}</td>
                    <td>{stage.workflow_stage_name}</td>
                    <td>
                      <span
                        className={`badge ${stage.workflow_stage_color} px-3 py-2`}
                      >
                        {stage.workflow_stage_color.replace("bg-", "")}
                      </span>
                    </td>
                    <td>{renderBool(stage.workflow_stage_attachment)}</td>
                    <td>{renderBool(stage.workflow_stage_otp)}</td>
                    <td>
                      {index > 1 && (
                        <>
                          <button
                            type="button"
                            className="text-primary border-0 bg-transparent"
                            onClick={() => onEditStage(stage)}
                          >
                            <i className="ri-pencil-fill fs-16" />
                          </button>
                          <button
                            type="button"
                            className="text-danger border-0 bg-transparent"
                            onClick={() =>
                              onDeleteStage(stage.workflow_child_id)
                            }
                          >
                            <i className="ri-delete-bin-5-fill fs-16" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No close stages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Col>
    </>
  );
};

export default WorkflowUpdateStagesTable;
