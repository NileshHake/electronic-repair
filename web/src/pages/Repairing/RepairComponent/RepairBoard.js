import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
} from "reactstrap";

import ChangeStage from "../StageChangeModals/ChangeStage";
import { formatDateTime } from "../../../helpers/date_and_time_format";

/* ===== helpers ===== */
const getStageMeta = (workflowStages = [], stageId) => {
  const s = workflowStages.find((x) => Number(x?.workflow_child_id) === Number(stageId));
  return {
    name: s?.workflow_stage_name || "-",
    color: s?.workflow_stage_color || "bg-secondary",
  };
};

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
  // ✅ FIXED: correct precedence
  const hasRepairPermission = useMemo(() => {
    return permissions?.some(
      (p) =>
        (p?.permission_category === "REPAIRING" ||
          p?.permission_category === "REPAIRINGCUSTOMER") &&
        String(p?.permission_path) === "1"
    );
  }, [permissions]);

  // Stage modal
  const [isOpenStageModal, setIsOpenStageModal] = useState(false);
  const [selectedForStage, setSelectedForStage] = useState(null);

  const openStageModal = (repairRow) => {
    setSelectedForStage(repairRow);
    setIsOpenStageModal(true);
  };

  const closeStageModal = () => {
    setIsOpenStageModal(false);
    setSelectedForStage(null);
  };

  const totalAmount = useMemo(() => {
    return (repairs || []).reduce((sum, r) => sum + Number(r?.repair_estimated_cost || 0), 0);
  }, [repairs]);

  const totalCount = repairs?.length || 0;
  const navigate = useNavigate();

  return (
    <>
      <div className="table-responsive"  >
        <table className="table align-middle table-hover mb-0">
          <thead
            className="table-light text-uppercase text-muted  "

          >
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th style={{ width: "10%" }}>Repair ID</th>
              <th style={{ width: "20%" }}>Device</th>
              <th style={{ width: "20%" }}>Customer</th>
              <th style={{ width: "12%" }}>Stage</th>
              <th style={{ width: "10%" }}>Est. Cost</th>
              <th style={{ width: "13%" }}>Received</th>
              <th style={{ width: "13%" }}>Expected</th>
              <th style={{ width: "12%" }} className="text-end">
                Actions
              </th>
            </tr>
          </thead>                                                                    
          <tbody>
            {hasRepairPermission && repairs?.length > 0 ? (
              repairs.map((item, index) => {
                const { name: stageName, color: stageColor } = getStageMeta(
                  workflowStages,
                  item?.repair_workflow_stage_id
                );

                return (
                  <tr key={item?.repair_id || index} onClick={() => navigate(`/repair/overview/${item?.repair_id}`)}>
                    <td>{index + 1}</td>

                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                        R-{item?.repair_id}
                      </span>
                    </td>

                    <td title={item?.device_type_name || ""}>
                      <div className="fw-bold">{item?.device_type_name || "Unnamed Product"}</div>
                      <div className="text-muted small">{item?.repair_problem || "-"}</div>
                    </td>

                    <td>
                      <div className="fw-bold">{item?.customer_name || "-"}</div>
                      <div className="text-muted small">{item?.customer_phone || "-"}</div>
                      <div className="text-muted small">{item?.customer_email || "-"}</div>
                    </td>

                    <td>
                      <span className={`badge ${stageColor} text-white`}>
                        {stageName}
                      </span>
                    </td>

                    <td className="fw-bold text-success">₹{Number(item?.repair_estimated_cost || 0)}</td>

                    <td className="text-muted small">
                      {formatDateTime(item?.repair_received_date) || "-"}
                    </td>

                    <td className="text-warning small">
                      {item?.repair_expected_delivery_date || "-"}
                    </td>


                    <td className="text-center">
                      <ul className="list-inline hstack mb-0 justify-content-center">
                        {/* VIEW */}


                        {/* UPDATE */}
                        {canUpdate && (
                          <li className="list-inline-item">
                            <button
                              className="text-primary border-0 bg-transparent"
                              title="Edit Repair"
                              onClick={() => {
                                setSelectedRepair(item);
                                setIsUpdateModalOpen(true);
                              }}
                            >
                              <i className="ri-pencil-fill fs-16"></i>
                            </button>
                          </li>
                        )}

                        {/* DELETE */}
                        {canDelete && (
                          <li className="list-inline-item">
                            <button
                              className="text-danger border-0 bg-transparent"
                              title="Delete Repair"
                              onClick={() => onClickDelete(item)}
                            >
                              <i className="ri-delete-bin-5-fill fs-16"></i>
                            </button>
                          </li>
                        )}
                        <li className="list-inline-item">
                          <button
                            className="text-success border-0 bg-transparent"
                            title="Move Stage"
                            onClick={() => openStageModal(item)}
                          >
                            <i className="ri-arrow-right-circle-line fs-16"></i>
                          </button>
                        </li>
                      </ul>

                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
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
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {
        isOpenStageModal && (
          <ChangeStage
            isOpen={isOpenStageModal}
            workflowStages={workflowStages}
            toggle={closeStageModal}
            currentStageName={selectedForStage?.current_stage_name || "Current"}
            nextStageName={selectedForStage?.next_stage_name || "Next"}
            isSelectedData={selectedForStage}
          />
        )
      }
    </>


  );
};

export default RepairBoard;
