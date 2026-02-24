import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ChangeStage from "../../Repairing/StageChangeModals/ChangeStage";

import {
  addStageRemark,
  resetAddStageRemarkResponse,
} from "../../../store/StageRemarkData";
import { getRecoveryList } from "../../../store/recovery";
 

const ChangeStageRecovery = (props) => {
  const dispatch = useDispatch();

  // ✅ IMPORTANT: use SAME reducer which is working for repair
  const { addStageRemarkResponse, loading } = useSelector(
    (state) => state.StageRemarkReducer || {}
  );

  const selected = props?.isSelectedData;

  return (
    <ChangeStage
      {...props}
      moduleType="recovery"
      entityKey="stage_remark_recovery_id" // ✅ backend same key
      entityId={selected?.recovery_id || ""}
      pastStageId={selected?.recovery_workflow_stage_id || ""}
      onSubmit={(fd) => dispatch(addStageRemark(fd))}
      onRefresh={() => dispatch(getRecoveryList())}
      success={!!addStageRemarkResponse}
      resetSuccess={() => dispatch(resetAddStageRemarkResponse())}
      loading={!!loading}
    />
  );
};

export default ChangeStageRecovery;