import React from "react";
import RepairCard from "./RepairCard";

const RepairStageColumn = ({
  stage,
  stageRepairs = [],
  canUpdate,
  canDelete,
  setSelectedRepair,
  workflowStages,
  setIsUpdateModalOpen,
  onClickDelete,
}) => {
  const totalAmount = stageRepairs.reduce(
    (sum, r) => sum + Number(r.repair_estimated_cost || 0),
    0
  );

  return (
    <td
      className="border-0 px-3 align-top"
      style={{ minWidth: "380px", width: "380px", verticalAlign: "top" }}
    >
      {/* === Stage Header Line === */}
      <div
        className={stage.workflow_stage_color}
        style={{ width: "470px", height: "3px", borderRadius: "10px" }}
      ></div>

      {/* === Stage Card Header === */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "10px" }}>
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold" style={{ fontSize: "1.1rem", maxWidth: "250px" }}>
              {stage.workflow_stage_name}
            </h5>
            <div className="badge bg-light text-dark rounded-pill px-3 py-2">
              {stageRepairs.length} Repairs
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="text-muted small">Total Amount:</span>
            <span className="fw-bold text-success" style={{ fontSize: "1.1rem" }}>
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* === Repair List === */}
      <div
        className="custom-scroll"
        style={{
          maxHeight: "calc(100vh - 250px)",
          overflowY: "scroll",
          paddingRight: "10px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .custom-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {stageRepairs.length > 0 ? (
          stageRepairs.map((item, i) => (
            <RepairCard
              key={i}
              item={item}
              canUpdate={canUpdate}
              workflowStages={workflowStages}
              canDelete={canDelete}
              setSelectedRepair={setSelectedRepair}
              setIsUpdateModalOpen={setIsUpdateModalOpen}
              onClickDelete={onClickDelete}
            />
          ))
        ) : (
          <div
            className="text-center py-4 text-muted bg-light rounded"
            style={{ minWidth: "350px" }}
          >
            <i className="ri-inbox-line display-5"></i>
            <p className="mt-2 mb-0">No repairs in this stage</p>
          </div>
        )}
      </div>
    </td>
  );
};

export default RepairStageColumn;
