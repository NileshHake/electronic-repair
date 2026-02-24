/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
  
import { resetAddRecoveryResponse } from "../../store/recovery/index";
 
import { useRecoveryLookups } from "./hooks/useRepairLookups";
import { useRecoveryForm } from "./hooks/useRepairForm";
import RecoveryFormSimple from "./component/RecoveryFormSimple";
import CustomerAdd from "../Customer/CustomerAdd";

const RecoveryAdd = ({ isOpen, toggle }) => {
  const lookups = useRecoveryLookups();
  const form = useRecoveryForm({ toggle, mode: "add", initialData: null });

  const dispatch = useDispatch();
  const { addRecoveryResponse } = useSelector((state) => state.RecoveryReducer) || {};

  useEffect(() => {
    if (addRecoveryResponse) {
      toggle(); // close modal
      dispatch(resetAddRecoveryResponse()); // reset flag
    }
  }, [addRecoveryResponse, dispatch, toggle]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Add Recovery Inquiry
      </ModalHeader>

      <form onSubmit={form.onSubmit}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            <RecoveryFormSimple form={form} lookups={lookups} />

            <ModalFooter>
              <div className="hstack gap-2 justify-content-center mt-2">
                <Button color="danger" type="button" onClick={toggle}>
                  Close
                </Button>
                <Button color="primary" type="submit">
                  Save
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

export default RecoveryAdd;