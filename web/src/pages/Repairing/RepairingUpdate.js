/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Repairing/RepairingUpdate.js
import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { useRepairForm } from "./hooks/useRepairForm";
import { useRepairLookups } from "./hooks/useRepairLookups";

import CustomerAdd from "../Customer/CustomerAdd";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";
import BrandAdd from "../Brand/BrandAdd";
import DeviceModelAdd from "../DeviceModel/DeviceModelAdd";
import DeviceColorAdd from "../DeviceColor/DeviceColorAdd";
import ServiceAdd from "../Services/ServiceAdd";
import HardwareConfigurationAdd from "../HardwareConfiguration/HardwareConfigurationAdd";

import { resetUpdateRepairResponse, getRepairList } from "../../store/Repairing";
import RepairTabs from "./Tabs/RepairTabs";

const RepairingUpdate = ({ isOpen, toggle, isRepairData }) => {
  const dispatch = useDispatch();

  const lookups = useRepairLookups(); // redux lists
  const form = useRepairForm({
    toggle,
    mode: "update",
    initialData: isRepairData,
  });

  const { updateRepairResponse } = useSelector((s) => s.RepairReducer || {});

  useEffect(() => {
    if (updateRepairResponse) {
      toggle();
      dispatch(resetUpdateRepairResponse());
      dispatch(getRepairList());
    }
  }, [updateRepairResponse, dispatch, toggle]);

  // ✅ fetch stages when workflow changes
  useEffect(() => {
    const wid = Number(form.formData?.repair_workflow_id || 0);
    if (wid) lookups.fetchWorkflowStages(wid);
  }, [form.formData?.repair_workflow_id]);

  // ✅ keep current stage (from isRepairData), only fallback if invalid
  useEffect(() => {
    const stages = lookups.data?.workflowStages || [];
    if (!stages.length) return;

    const current = Number(form.formData?.repair_workflow_stage_id || 0);
    const exists = stages.some((s) => Number(s.workflow_child_id) === current);

    if (!current || !exists) {
      form.setField("repair_workflow_stage_id",  isRepairData?.repair_workflow_stage_id);
    }
  }, [lookups.data?.workflowStages]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Update Repair Inquiry
      </ModalHeader>

      <form onSubmit={form.onSubmit}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            <RepairTabs
              activeTab={form.activeTab}
              setActiveTab={form.setActiveTab}
              form={form}
              lookups={lookups}
            />

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

      {/* Sub Modals */}
      {lookups.ui.isCustomerOpen && (
        <CustomerAdd
          isOpen={lookups.ui.isCustomerOpen}
          toggle={() => lookups.ui.setIsCustomerOpen(false)}
        />
      )}

      {lookups.ui.isDeviceTypeOpen && (
        <DeviceTypeAdd
          isOpen={lookups.ui.isDeviceTypeOpen}
          toggle={() => lookups.ui.setIsDeviceTypeOpen(false)}
        />
      )}

      {lookups.ui.isBrandOpen && (
        <BrandAdd
          isOpen={lookups.ui.isBrandOpen}
          toggle={() => lookups.ui.setIsBrandOpen(false)}
        />
      )}

      {lookups.ui.isDeviceModelOpen && (
        <DeviceModelAdd
          isOpen={lookups.ui.isDeviceModelOpen}
          toggle={() => lookups.ui.setIsDeviceModelOpen(false)}
        />
      )}

      {lookups.ui.isDeviceColorOpen && (
        <DeviceColorAdd
          isOpen={lookups.ui.isDeviceColorOpen}
          toggle={() => lookups.ui.setIsDeviceColorOpen(false)}
        />
      )}

      {lookups.ui.isServiceOpen && (
        <ServiceAdd
          isOpen={lookups.ui.isServiceOpen}
          toggle={() => lookups.ui.setIsServiceOpen(false)}
        />
      )}

      {lookups.ui.isHardwareConfigOpen && (
        <HardwareConfigurationAdd
          isOpen={lookups.ui.isHardwareConfigOpen}
          toggle={() => lookups.ui.setIsHardwareConfigOpen(false)}
        />
      )}
    </Modal>
  );
};

export default RepairingUpdate;
