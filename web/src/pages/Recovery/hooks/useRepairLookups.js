/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/hooks/useRecoveryLookups.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getCustomerList } from "../../../store/Customer";
import { getWorkflowList, getWorkflowStageList } from "../../../store/Workflow";

export const useRecoveryLookups = () => {
  const dispatch = useDispatch();

  // ✅ UI flags (same style as useRepairLookups)
  const [ui, setUi] = useState({
    isCustomerOpen: false,

    setIsCustomerOpen: () => {},
  });

  ui.setIsCustomerOpen = (v) => setUi((p) => ({ ...p, isCustomerOpen: v }));

  // ✅ Read reducers
  const { CustomerReducer, WorkflowReducer } = useSelector((state) => state);

  // ✅ normalize lists
  const customers =
    CustomerReducer?.customerList?.data || CustomerReducer?.customerList || [];

  const workflows = WorkflowReducer?.workflows || [];
  const workflowStages = WorkflowReducer?.workflowStages || [];

  // ✅ fetch lists
  const refetch = () => {
    [getCustomerList, getWorkflowList].forEach((action) => dispatch(action()));
  };

  useEffect(() => {
    refetch();
  }, [dispatch]);

  // ✅ workflow stage fetch
  const fetchWorkflowStages = (workflowId) => {
    const wid = Number(workflowId || 0);
    if (!wid) return;
    dispatch(getWorkflowStageList(wid));
  };

  // ✅ return (Product style)
  const data = useMemo(
    () => ({
      customers,
      workflows,
      workflowStages,
    }),
    [customers, workflows, workflowStages]
  );

  return { data, ui, refetch, fetchWorkflowStages };
};