import React, { useState } from "react";
import { Link } from "react-router-dom";
import ChangeStage from "../StageChangeModals/ChangeStage";
import { formatDateTime } from "../../../helpers/date_and_time_format";

const RepairCard = ({
  item,
  canUpdate,
  canDelete,
  setSelectedRepair,
  workflowStages,
  setIsUpdateModalOpen,
  onClickDelete,
}) => {
  const [isOpenStageModal, setIsOpenStageModal] = useState(false);
  const [isSelectedData, setIsSelectedData] = useState(null);

  return (
    <div
      className="card mb-3 border-0 shadow-sm hover-shadow transition-all"
      style={{ cursor: "pointer", borderRadius: "10px", minWidth: "350px" }}
    >
      <Link to={`/repair/overview/${item.repair_id}`}>
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-1">
                R-{item.repair_id}
              </span>
              <h6
                className="mb-1"
                style={{ fontSize: "1rem", fontWeight: "500" }}
              >
                {item.device_type_name || "Unnamed Product"}
              </h6>
            </div>

            <div className="d-flex align-items-center gap-2">
              {canUpdate && (
                <button
                  className="btn btn-sm btn-light rounded-circle p-1"
                  style={{ width: "28px", height: "28px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedRepair(item);
                    setIsUpdateModalOpen(true);
                  }}
                  title="Edit Repair"
                >
                  <i className="ri-pencil-fill fs-14 text-primary"></i>
                </button>
              )}

              {canDelete && (
                <button
                  className="btn btn-sm btn-light rounded-circle p-1"
                  style={{ width: "28px", height: "28px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    onClickDelete(item);
                  }}
                  title="Delete Repair"
                >
                  <i className="ri-delete-bin-5-fill fs-14 text-danger"></i>
                </button>
              )}
            </div>
          </div>

          <div className="mt-2">
            <div className="d-flex align-items-center mb-2">
              <i className="ri-user-line me-2 text-muted fs-16"></i>
              <span style={{ fontSize: "0.9rem" }}>
                {item.customer_name || "N/A"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="me-2 text-muted fs-16">₹</span>
              <span
                className="text-success fw-bold"
                style={{ fontSize: "0.95rem" }}
              >
                ₹{item.repair_estimated_cost || "0"}
              </span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <i className="ri-calendar-line me-2 text-muted fs-16"></i>
              <small className="text-muted">
                {formatDateTime(item?.repair_received_date) || "-"}
              </small>
            </div>

            <div className="d-flex align-items-center">
              <i className="ri-alarm-warning-line me-2 text-muted fs-16"></i>
              <small className="text-warning">
                {item.repair_expected_delivery_date || "-"}
              </small>
            </div>
          </div>

          <button
            className="btn btn-sm w-100 mt-3 py-2 btn-primary"
            style={{ borderRadius: "6px" }}
            onClick={(e) => {
              e.preventDefault();      // also prevent Link navigation
              e.stopPropagation();
              setIsSelectedData(item);
              setIsOpenStageModal(true);
            }}
          >
            <i className="ri-arrow-right-circle-line me-1"></i>
            Move Stage
          </button>
        </div>
      </Link>

      {/* Stage Change Modal */}
      {isOpenStageModal && (
        <ChangeStage
          isOpen={isOpenStageModal}
          workflowStages={workflowStages}
          toggle={() => setIsOpenStageModal(false)}
          // purely design: send some stage names from item if you have them
          currentStageName={isSelectedData?.current_stage_name || "New"}
          nextStageName={isSelectedData?.next_stage_name || "In Progress"}
          // raw selected data if you want to use later in logic
          isSelectedData={isSelectedData}
        />
      )}
    </div>
  );
};

export default RepairCard;
