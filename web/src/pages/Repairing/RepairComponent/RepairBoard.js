import React from "react";
import { Link } from "react-router-dom";
import RepairStageColumn from "./RepairStageColumn";

const RepairBoard = ({
  repairs = [],
  workflowStages = [],
  permissions = [],
  canUpdate,
  canDelete,
  setSelectedRepair,
  setIsUpdateModalOpen,
  onClickDelete,
}) => {
  const hasRepairPermission = permissions.some(
    (p) => p.permission_category === "REPAIRING"|| p.permission_category === "REPAIRINGCUSTOMER" && p.permission_path === "1"
  );

  return (
    <div className="table-responsive">
      <table className="align-middle table table-hover table-nowrap">
        <tbody>
          <tr>
            {hasRepairPermission && repairs.length > 0 ? (
              workflowStages.map((stage, index) => {
                const stageRepairs = repairs.filter(
                  (r) => r.repair_workflow_stage_id === stage.workflow_child_id
                );
                return (
                  <RepairStageColumn
                    key={index}
                    stage={stage}
                    stageRepairs={stageRepairs}
                    canUpdate={canUpdate}
                    workflowStages={workflowStages}
                    canDelete={canDelete}
                    setSelectedRepair={setSelectedRepair}
                    setIsUpdateModalOpen={setIsUpdateModalOpen}
                    onClickDelete={onClickDelete}
                  />
                );
              })
            ) : (
              <td colSpan="9" className="text-center py-5">
                <lord-icon
                  src="https://cdn.lordicon.com/msoeawqm.json"
                  trigger="loop"
                  colors="primary:#405189,secondary:#0ab39c"
                  style={{ width: "72px", height: "72px" }}
                ></lord-icon>
                <div className="mt-4">
                  <h5>Sorry! No Repair Found</h5>
                </div>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RepairBoard;
