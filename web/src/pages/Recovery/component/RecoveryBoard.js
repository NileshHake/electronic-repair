/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/RecoveryComponent/RecoveryBoard.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import ChangeStageRecovery from "../StageChangeModals/ChangeStageRecovery";

/* ===== helpers ===== */
const getStageMeta = (workflowStages = [], stageId) => {
  const s = (workflowStages || []).find(
    (x) => Number(x?.workflow_child_id) === Number(stageId)
  );
  return {
    name: s?.workflow_stage_name || "-",
    color: s?.workflow_stage_color || "bg-secondary",
  };
};

const RecoveryBoard = ({
  recoveries = [],
  workflowStages = [],
  permissions = [],
  canUpdate,
  canDelete,
  setSelectedRecovery,
  setIsUpdateModalOpen,
  onClickDelete,

  // ✅ Infinite scroll
  fetchNextPage,
  hasMore = false,
  loading = false,
}) => {
  const hasRecoveryPermission = useMemo(() => {
    return permissions?.some(
      (p) =>
        (p?.permission_category === "RECOVERY" ||
          p?.permission_category === "RECOVERYCUSTOMER") &&
        String(p?.permission_path) === "1"
    );
  }, [permissions]);

  // Stage modal
  const [isOpenStageModal, setIsOpenStageModal] = useState(false);
  const [selectedForStage, setSelectedForStage] = useState(null);

  const openStageModal = (row) => {
    setSelectedForStage(row);
    setIsOpenStageModal(true);
  };

  const closeStageModal = () => {
    setIsOpenStageModal(false);
    setSelectedForStage(null);
  };

  const navigate = useNavigate();
  const scrollDivId = "scrollableRecoveryDiv";

  return (
    <>
      <div
        id={scrollDivId}
        style={{
          height: "70vh",
          overflow: "auto",
        }}
      >
        <InfiniteScroll
          dataLength={recoveries.length}
          next={fetchNextPage}
          hasMore={hasMore}
          loader={
            <h6 className="text-center py-3 mb-0">
              {loading ? "Loading more..." : "Loading..."}
            </h6>
          }
          scrollableTarget={scrollDivId}
        >
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light text-uppercase text-muted">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "10%" }}>Recovery ID</th>
                  <th style={{ width: "25%" }}>Problem</th>
                  <th style={{ width: "20%" }}>Customer</th>
                  <th style={{ width: "12%" }}>Stage</th>
                  <th style={{ width: "13%" }}>Received</th>
                  <th style={{ width: "12%" }} className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {hasRecoveryPermission && recoveries?.length > 0 ? (
                  recoveries.map((item, index) => {
                    const { name: stageName, color: stageColor } = getStageMeta(
                      workflowStages,
                      item?.recovery_workflow_stage_id
                    );

                    return (
                      <tr
                        key={item?.recovery_id || index}
                        onClick={() =>
                          navigate(`/recovery/overview/${item?.recovery_id}`)
                        }
                      >
                        <td>{index + 1}</td>

                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            RC-{item?.recovery_id}
                          </span>
                        </td>

                        <td title={item?.recovery_problem_description || ""}>
                          <div className="fw-bold">Recovery</div>
                          <div
                            className="text-muted small"
                            dangerouslySetInnerHTML={{
                              __html: item?.recovery_problem_description || "-",
                            }}
                          />
                        </td>

                        <td>
                          <div className="fw-bold">{item?.customer_name || "-"}</div>
                          <div className="text-muted small">
                            {item?.customer_phone_number ||
                              item?.customer_phone ||
                              "-"}
                          </div>
                          <div className="text-muted small">
                            {item?.customer_email || "-"}
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${stageColor} text-white`}>
                            {stageName}
                          </span>
                        </td>

                        <td className="text-muted small">
                          {formatDateTime(item?.recovery_received_date) || "-"}
                        </td>

                        <td className="text-center">
                          <ul className="list-inline hstack mb-0 justify-content-center">
                            {/* UPDATE */}
                            {canUpdate && (
                              <li className="list-inline-item">
                                <button
                                  className="text-primary border-0 bg-transparent"
                                  title="Edit Recovery"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRecovery(item);
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
                                  title="Delete Recovery"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClickDelete(item);
                                  }}
                                >
                                  <i className="ri-delete-bin-5-fill fs-16"></i>
                                </button>
                              </li>
                            )}

                            {/* MOVE STAGE */}
                            <li className="list-inline-item">
                              <button
                                className="text-success border-0 bg-transparent"
                                title="Move Stage"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openStageModal(item);
                                }}
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
                    <td colSpan="7" className="text-center py-5">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#405189,secondary:#0ab39c"
                        style={{ width: "72px", height: "72px" }}
                      ></lord-icon>
                      <div className="mt-4">
                        <h5>Sorry! No Recovery Found</h5>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </InfiniteScroll>
      </div>

      {isOpenStageModal && (
        <ChangeStageRecovery
          isOpen={isOpenStageModal}
          toggle={closeStageModal}
          workflowStages={workflowStages}
          isSelectedData={selectedForStage}
        />
      )}
    </>
  );
};

export default RecoveryBoard;