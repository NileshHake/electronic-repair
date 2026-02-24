// ✅ src/pages/Repairing/StageChangeModals/ChangeStageRepair.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ChangeStage from "./ChangeStage";

// ✅ your existing repair stage remark store
import {
  addStageRemark,
  resetAddStageRemarkResponse,
} from "../../../store/StageRemarkData";

import { getRepairList } from "../../../store/Repairing";

const ChangeStageRepair = (props) => {
  const dispatch = useDispatch();

  const { addStageRemarkResponse, loading } = useSelector(
    (state) => state.StageRemarkReducer || {}
  );

  const selected = props?.isSelectedData;

  return (
    <ChangeStage
      {...props}
      moduleType="repair"
      entityKey="stage_remark_repair_id"
      entityId={selected?.repair_id || ""}
      pastStageId={selected?.repair_workflow_stage_id || ""}
      onSubmit={(fd) => dispatch(addStageRemark(fd))}
      onRefresh={() => dispatch(getRepairList())}
      success={!!addStageRemarkResponse}
      resetSuccess={() => dispatch(resetAddStageRemarkResponse())}
      loading={!!loading}
    />
  );
};

export default ChangeStageRepair;