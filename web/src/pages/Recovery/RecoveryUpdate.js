/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/RecoveryUpdate.js
import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { useRecoveryLookups } from "./hooks/useRepairLookups";
import { useRecoveryForm } from "./hooks/useRepairForm";
import RecoveryFormSimple from "./component/RecoveryFormSimple";;

import { resetUpdateRecoveryResponse, getRecoveryList } from "../../store/recovery/index";
import CustomerAdd from "../Customer/CustomerAdd";
 
const RecoveryUpdate = ({ isOpen, toggle, isRecoveryData }) => {
  const dispatch = useDispatch();

  const lookups = useRecoveryLookups(); // only customers
  const form = useRecoveryForm({
    toggle,
    mode: "update",
    initialData: isRecoveryData,
  });

  const { updateRecoveryResponse } = useSelector((s) => s.RecoveryReducer || {});

  useEffect(() => {
    if (updateRecoveryResponse) {
      toggle();
      dispatch(resetUpdateRecoveryResponse());
      // refresh list (optional payload if you use filters)
      dispatch(getRecoveryList({}));
    }
  }, [updateRecoveryResponse, dispatch, toggle]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Update Recovery Inquiry
      </ModalHeader>

      <form onSubmit={form.onSubmit}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            {/* ✅ no tabs - single component */}
            <RecoveryFormSimple form={form} lookups={lookups} />

            <ModalFooter>
              <div className="hstack gap-2 justify-content-center mt-2">
                <Button color="danger" type="button" onClick={toggle}>
                  Close
                </Button>
                <Button color="primary" type="submit">
                  Update
                </Button>
              </div>
            </ModalFooter>
          </Card>
        </div>
      </form>
      {lookups.ui.isCustomerOpen && (
  <CustomerAdd
    isOpen={lookups.ui.isCustomerOpen}
    toggle={() => {
      lookups.ui.setIsCustomerOpen(false);
      lookups.refetch(); // ✅ refresh customers after add
    }}
  />
)}
    </Modal>
  );
};

export default RecoveryUpdate;