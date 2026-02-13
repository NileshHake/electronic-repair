import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";

import { useRepairForm } from "./hooks/useRepairForm";
import { useRepairLookups } from "./hooks/useRepairLookups"; 
import CustomerAdd from "../Customer/CustomerAdd";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";
import BrandAdd from "../Brand/BrandAdd";
import DeviceModelAdd from "../DeviceModel/DeviceModelAdd";
import DeviceColorAdd from "../DeviceColor/DeviceColorAdd";
import ServiceAdd from "../Services/ServiceAdd";
import HardwareConfigurationAdd from "../HardwareConfiguration/HardwareConfigurationAdd";

import { useDispatch, useSelector } from "react-redux";
import { resetAddRepairResponse } from "../../store/Repairing";
import RepairTabs from "./Tabs/RepairTabs";

const RepairingAdd = ({ isOpen, toggle }) => {
  const lookups = useRepairLookups();     // ✅ like Product
  const form = useRepairForm({ toggle, lookups }); // ✅ like Product

  const dispatch = useDispatch();
  const { addRepairResponse } = useSelector((state) => state.RepairReducer);

  useEffect(() => {
    if (addRepairResponse) {
      toggle(); // ✅ close modal
      dispatch(resetAddRepairResponse()); // ✅ reset flag
      form.resetForm?.(); // optional
    }
  }, [addRepairResponse, dispatch, toggle]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Add Repair Inquiry
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
                  Save
                </Button>
              </div>
            </ModalFooter>
          </Card>
        </div>
      </form>

      {/* Sub Modals - exactly like Product */}
      {lookups.ui.isCustomerOpen && (
        <CustomerAdd
          isOpen={lookups.ui.isCustomerOpen}
          toggle={() => {
            lookups.ui.setIsCustomerOpen(false);
            lookups.refetch(); // ✅ refresh after add
          }}
        />
      )}

      {lookups.ui.isDeviceTypeOpen && (
        <DeviceTypeAdd
          isOpen={lookups.ui.isDeviceTypeOpen}
          toggle={() => {
            lookups.ui.setIsDeviceTypeOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isBrandOpen && (
        <BrandAdd
          isOpen={lookups.ui.isBrandOpen}
          toggle={() => {
            lookups.ui.setIsBrandOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isDeviceModelOpen && (
        <DeviceModelAdd
          isOpen={lookups.ui.isDeviceModelOpen}
          toggle={() => {
            lookups.ui.setIsDeviceModelOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isDeviceColorOpen && (
        <DeviceColorAdd
          isOpen={lookups.ui.isDeviceColorOpen}
          toggle={() => {
            lookups.ui.setIsDeviceColorOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isServiceOpen && (
        <ServiceAdd
          isOpen={lookups.ui.isServiceOpen}
          toggle={() => {
            lookups.ui.setIsServiceOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isHardwareConfigOpen && (
        <HardwareConfigurationAdd
          isOpen={lookups.ui.isHardwareConfigOpen}
          toggle={() => {
            lookups.ui.setIsHardwareConfigOpen(false);
            lookups.refetch();
          }}
        />
      )}
    </Modal>
  );
};

export default RepairingAdd;
