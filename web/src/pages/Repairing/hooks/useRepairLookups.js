import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// ✅ Redux Actions (same as your RepairingAdd)
import { getCustomerList } from "../../../store/Customer";
import { getTechniciansList } from "../../../store/Technician";
import { getDeliveryBoysList } from "../../../store/DeliveryAndPickUpBoy";
import { getWorkflowList, getWorkflowStageList } from "../../../store/Workflow";
import { getSourcesList } from "../../../store/Source";
import { getRepairTypesList } from "../../../store/RepairType";
import { getDeviceTypesList } from "../../../store/DeviceType";
import { getServiceTypeList } from "../../../store/ServiceType";
import { getBrandsList } from "../../../store/Brand";
import { getDeviceModelsList } from "../../../store/DeviceModel";
import { getAccessoriesList } from "../../../store/Accessories";
import { getStorageLocationsList } from "../../../store/StorageLocation";
import { getDeviceColorList } from "../../../store/DeviceColor";
import { getServicesList } from "../../../store/Service";
import { getHardwareConfigurations } from "../../../store/HardwareConfiguration";

export const useRepairLookups = () => {
  const dispatch = useDispatch();

  // ✅ UI flags (same Product style)
  const [ui, setUi] = useState({
    isCustomerOpen: false,
    isDeviceTypeOpen: false,
    isBrandOpen: false,
    isDeviceModelOpen: false,
    isDeviceColorOpen: false,
    isServiceOpen: false,
    isHardwareConfigOpen: false,

    setIsCustomerOpen: () => {},
    setIsDeviceTypeOpen: () => {},
    setIsBrandOpen: () => {},
    setIsDeviceModelOpen: () => {},
    setIsDeviceColorOpen: () => {},
    setIsServiceOpen: () => {},
    setIsHardwareConfigOpen: () => {},
  });

  ui.setIsCustomerOpen = (v) => setUi((p) => ({ ...p, isCustomerOpen: v }));
  ui.setIsDeviceTypeOpen = (v) => setUi((p) => ({ ...p, isDeviceTypeOpen: v }));
  ui.setIsBrandOpen = (v) => setUi((p) => ({ ...p, isBrandOpen: v }));
  ui.setIsDeviceModelOpen = (v) => setUi((p) => ({ ...p, isDeviceModelOpen: v }));
  ui.setIsDeviceColorOpen = (v) => setUi((p) => ({ ...p, isDeviceColorOpen: v }));
  ui.setIsServiceOpen = (v) => setUi((p) => ({ ...p, isServiceOpen: v }));
  ui.setIsHardwareConfigOpen = (v) => setUi((p) => ({ ...p, isHardwareConfigOpen: v }));

  // ✅ Read all reducers once
  const {
    CustomerReducer,
    TechnicianReducer,
    DeliveryBoyReducer,
    WorkflowReducer,
    SourceReducer,
    RepairTypeReducer,
    DeviceTypeReducer,
    ServiceTypeReducer,
    BrandReducer,
    DeviceModelReducer,
    AccessoriesReducer,
    StorageLocationReducer,
    DeviceColorReducer,
    ServiceReducer,
    HardwareConfigurationReducer,
  } = useSelector((state) => state);

  // ✅ normalize lists
  const customers =
    CustomerReducer?.customerList?.data || CustomerReducer?.customerList || [];

  const technicians = TechnicianReducer?.technicians || [];
  const deliveryBoys = DeliveryBoyReducer?.deliveryBoys || [];

  const workflows = WorkflowReducer?.workflows || [];
  const workflowStages = WorkflowReducer?.workflowStages || [];

  const sources = SourceReducer?.sources || [];
  const repairTypes = RepairTypeReducer?.repairTypes || [];
  const deviceTypes = DeviceTypeReducer?.deviceTypes || [];
  const serviceTypes = ServiceTypeReducer?.serviceTypes || [];
  const brands = BrandReducer?.brands || [];
  const deviceModels = DeviceModelReducer?.deviceModels || [];
  const accessories = AccessoriesReducer?.accessories || [];
  const storageLocations = StorageLocationReducer?.storageLocations || [];
  const deviceColors = DeviceColorReducer?.deviceColors || [];
  const services = ServiceReducer?.services || [];
  const hardwareConfigurations =
    HardwareConfigurationReducer?.hardwareConfigurations || [];

  // ✅ fetch all lists (same as your old useEffect)
  const refetch = () => {
    [
      getServicesList,
      getServiceTypeList,
      getHardwareConfigurations,
      getDeviceColorList,
      getStorageLocationsList,
      getAccessoriesList,
      getCustomerList,
      getDeviceTypesList,
      getWorkflowList,
      getTechniciansList,
      getDeviceModelsList,
      getDeliveryBoysList,
      getRepairTypesList,
      getSourcesList,
      getBrandsList,
    ].forEach((action) => dispatch(action()));
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // ✅ workflow stage fetch (NOT API direct)
  const fetchWorkflowStages = (workflowId) => {
    if (!workflowId) return;
    dispatch(getWorkflowStageList(workflowId));
  };

  // ✅ return as Product lookups style
  const data = useMemo(
    () => ({
      customers,
      technicians,
      deliveryBoys,
      workflows,
      workflowStages,

      sources,
      repairTypes,
      deviceTypes,
      serviceTypes,
      brands,
      deviceModels,
      accessories,
      storageLocations,
      deviceColors,
      services,
      hardwareConfigurations,
    }),
    [
      customers,
      technicians,
      deliveryBoys,
      workflows,
      workflowStages,
      sources,
      repairTypes,
      deviceTypes,
      serviceTypes,
      brands,
      deviceModels,
      accessories,
      storageLocations,
      deviceColors,
      services,
      hardwareConfigurations,
    ]
  );

  return { data, ui, refetch, fetchWorkflowStages };
};
