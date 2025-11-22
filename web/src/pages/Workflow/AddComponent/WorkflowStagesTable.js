// WorkflowStagesTable.jsx
import React from "react";
import { Col, Button } from "reactstrap";

const WorkflowStagesTable = ({
  workFlowStages,
  workFlowCloseStages,
  onAddOpenStage,
  onAddCloseStage,
  onEditOpenStage,
  onEditCloseStage,
  onDeleteStage,
}) => {
  const renderBool = (val) => (val ? "On" : "Off");

  return (
    <>
      {/* Open Stages */}
      <Col lg={12} className="mt-3">
        <div className="d-flex justify-content-between">
          <div className="fw-bold">Open Stages</div>
          <Button color="success" type="button" onClick={onAddOpenStage}>
            +
          </Button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover text-center mt-2">
            <thead className="table-light text-uppercase">
              <tr>
                <th>#</th>
                <th>Stage Name</th>
                <th>Color</th>
                <th>Attachment</th>
                <th>OTP</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workFlowStages.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.workflow_stages}</td>
                  <td>
                    <span
                      className={`badge ${item.workflow_stage_color} px-3 py-2`}
                    >
                      {item.workflow_stage_color.replace("bg-", "")}
                    </span>
                  </td>
                  <td>{renderBool(item.workflow_stage_attachment)}</td>
                  <td>{renderBool(item.workflow_stage_otp)}</td>
                  <td>
                    <button
                      type="button"
                      className="text-primary border-0 bg-transparent"
                      onClick={() => onEditOpenStage(index)}
                    >
                      <i className="ri-pencil-fill fs-16" />
                    </button>
                    <button
                      type="button"
                      className="text-danger border-0 bg-transparent"
                      onClick={() => onDeleteStage(index, false)}
                    >
                      <i className="ri-delete-bin-5-fill fs-16" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Col>

      {/* Close Stages */}
      <Col lg={12} className="mt-3">
        <div className="d-flex justify-content-between">
          <div className="fw-bold">Close Stages</div>
          <Button color="success" type="button" onClick={onAddCloseStage}>
            +
          </Button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover text-center mt-2">
            <thead className="table-light text-uppercase">
              <tr>
                <th>#</th>
                <th>Stage Name</th>
                <th>Color</th>
                <th>Attachment</th>
                <th>OTP</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workFlowCloseStages.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.workflow_close_stages}</td>
                  <td>
                    <span
                      className={`badge ${item.workflow_stage_color} px-3 py-2`}
                    >
                      {item.workflow_stage_color.replace("bg-", "")}
                    </span>
                  </td>
                  <td>{renderBool(item.workflow_stage_attachment)}</td>
                  <td>{renderBool(item.workflow_stage_otp)}</td>
                  <td>
                    {index > 1 && (
                      <>
                        <button
                          type="button"
                          className="text-primary border-0 bg-transparent"
                          onClick={() => onEditCloseStage(index)}
                        >
                          <i className="ri-pencil-fill fs-16" />
                        </button>
                        <button
                          type="button"
                          className="text-danger border-0 bg-transparent"
                          onClick={() => onDeleteStage(index, true)}
                        >
                          <i className="ri-delete-bin-5-fill fs-16" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Col>
    </>
  );
};

export default WorkflowStagesTable;
