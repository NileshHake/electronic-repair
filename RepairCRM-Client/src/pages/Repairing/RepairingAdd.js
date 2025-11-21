/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  Row,
  Col,
  Label,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  CardBody,
  Input,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Flatpickr from "react-flatpickr";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Redux Actions
import { getProductList } from "../../store/product/index";
import { getCustomerList } from "../../store/Customer";
import { getTechniciansList } from "../../store/Technician";
import { getDeliveryBoysList } from "../../store/DeliveryAndPickUpBoy";
import {
  addRepair,
  getRepairList,
  resetAddRepairResponse,
} from "../../store/Repairing";

// Helper
import { formatDateTime } from "../../helpers/date_and_time_format";
import { getWorkflowList, getWorkflowStageList } from "../../store/Workflow";
import WorkflowList from "../Workflow/WorkflowList";
import { getSourcesList } from "../../store/Source";
import { getRepairTypesList } from "../../store/RepairType";
import { getDeviceTypesList } from "../../store/DeviceType";
import { getServiceTypeList } from "../../store/ServiceType";
import { getBrandsList } from "../../store/Brand";
import { getDeviceModelsList } from "../../store/DeviceModel";
import { getAccessoriesList } from "../../store/Accessories";
import { getStorageLocationsList } from "../../store/StorageLocation";
import { getDeviceColorList } from "../../store/DeviceColor";
import { getServicesList } from "../../store/Service";
import { getHardwareConfigurations } from "../../store/HardwareConfiguration";
import CustomerAdd from "../Customer/CustomerAdd";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";
import BrandAdd from "../Brand/BrandAdd";
import DeviceModelAdd from "../DeviceModel/DeviceModelAdd";
import DeviceColorAdd from "../DeviceColor/DeviceColorAdd";
import ServiceAdd from "../Services/ServiceAdd";
import HardwareConfigurationAdd from "../HardwareConfiguration/HardwareConfigurationAdd";
import RepairTabBasicInfo from "./Tabs/RepairTabBasicInfo";
import RepairTabDeviceInfo from "./Tabs/RepairTabDeviceInfo";
import RepairTabServiceInfo from "./Tabs/RepairTabServiceInfo";
import RepairTabAdditionalInfo from "./Tabs/RepairTabAdditionalInfo";
import RepairTabGallery from "./Tabs/RepairTabGallery";

const RepairingAdd = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();

  // ================== STATES ==================
  const [activeTab, setActiveTab] = useState("1");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});

  // Form state for repair data
  const [formData, setFormData] = useState({
    repair_customer_id: "",
    repair_problem_description: "",
    repair_estimated_cost: "",
    repair_received_date: new Date(),
    repair_expected_delivery_date:  null,
    repair_assigned_technician_to: "",
    repair_delivery_and_pickup_to: "",
    repair_device_serial_number: "",
    repair_device_accessories_id: "",
    repair_device_services_id: [
  { service: "", cost: "" },  
],
    repair_device_priority: "",
    repair_device_password: "",
    repair_workflow_id: 0,
    repair_workflow_stage_id: 0,
    repair_source_id: 0,
    repair_referred_by_id: 0,
    repair_service_type_id: 0,
    repair_type_id: 0,
    repair_device_type_id: 0,
    repair_device_brand_id: 0,
    repair_device_storage_location_id: 0,
    repair_device_hardware_configuration_id: 0,
    repair_device_color_id: 0,
    repair_image: [],
  });

  // ================== REDUX SELECTORS ==================
   const customerList = useSelector(
    (state) => state.CustomerReducer?.customerList?.data || state.CustomerReducer?.customerList || []
  );

  const technicianList = useSelector(
    (state) => state.TechnicianReducer?.technicians || []
  );

  const deliveryBoyList = useSelector(
    (state) => state.DeliveryBoyReducer?.deliveryBoys || []
  );

  const workflows = useSelector(
    (state) => state.WorkflowReducer?.workflows || []
  );

  const workflowStages = useSelector(
    (state) => state.WorkflowReducer?.workflowStages || []
  );

  const addRepairResponse = useSelector(
    (state) => state.RepairReducer?.addRepairResponse
  );

  const sources = useSelector(
    (state) => state.SourceReducer?.sources
  );

  const repairTypes = useSelector(
    (state) => state.RepairTypeReducer?.repairTypes
  );

  const deviceTypes = useSelector(
    (state) => state.DeviceTypeReducer?.deviceTypes
  );

  const serviceTypes = useSelector(
    (state) => state.ServiceTypeReducer?.serviceTypes
  );

  const brands = useSelector(
    (state) => state.BrandReducer?.brands
  );

  const deviceModels = useSelector(
    (state) => state.DeviceModelReducer?.deviceModels
  );

  const accessories = useSelector(
    (state) => state.AccessoriesReducer?.accessories
  );

  const storageLocations = useSelector(
    (state) => state.StorageLocationReducer?.storageLocations
  );

  const deviceColors = useSelector(
    (state) => state.DeviceColorReducer?.deviceColors || []
  );

  const services = useSelector(
    (state) => state.ServiceReducer?.services
  );

  const hardwareConfigurations = useSelector(
    (state) => state.HardwareConfigurationReducer?.hardwareConfigurations || []
  );

  // ================== INITIAL DATA FETCH ==================
  useEffect(() => {
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
  }, [dispatch]);

  // ================== SUCCESS HANDLER ==================
  useEffect(() => {
    if (addRepairResponse) {
      toggle(); // Close modal after successful add
      dispatch(resetAddRepairResponse());
      setSelectedFiles([]);
      setErrorMessage({});
    }
  }, [addRepairResponse, dispatch, toggle]);

  // ================== OPTIONS MAPPERS ==================
  // Convert lists to react-select compatible options
  const mapOptions = (list, valueKey, labelKey) =>
    list.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));

  const customerOptions = mapOptions(
    customerList,
    "customer_id",
    "customer_name"
  );
  const technicianOptions = mapOptions(technicianList, "user_id", "user_name");
  const deliveryOptions = mapOptions(deliveryBoyList, "user_id", "user_name");
  const SourceOptions = mapOptions(sources, "source_id", "source_name");
  const repairTypesOption = mapOptions(
    repairTypes,
    "repair_type_id",
    "repair_type_name"
  );
  const deviceTypesOption = mapOptions(
    deviceTypes,
    "device_type_id",
    "device_type_name"
  );
  const serviceTypesOption = mapOptions(
    serviceTypes,
    "service_type_id",
    "service_type_name"
  );
  const brandsOption = mapOptions(brands, "brand_id", "brand_name");
  const deviceModelsOption = mapOptions(
    deviceModels,
    "device_model_id",
    "device_model_name"
  );
  const accessoriesOption = mapOptions(
    accessories,
    "accessories_id",
    "accessories_name"
  );
  const storageLocationsOption = mapOptions(
    storageLocations,
    "storage_location_id",
    "storage_location_name"
  );
  const deviceColorsOption = mapOptions(
    deviceColors,
    "device_color_id",
    "device_color_name"
  );
  const servicesOption = mapOptions(services, "service_id", "service_name");
  const workflowOption = mapOptions(workflows, "workflow_id", "workflow_name");
  const workfloStagewOption = mapOptions(
    workflowStages,
    "workflow_child_id",
    "workflow_stage_name"
  );

  // Custom label for hardware configuration
  const hardwareConfigurationsOption = hardwareConfigurations.map((w) => ({
    value: w.hardware_configuration_id,
    label: `${w.hardware_configuration_processor} | ${w.hardware_configuration_ram} | ${w.hardware_configuration_hard_disk} | ${w.hardware_configuration_ssd} | ${w.hardware_configuration_graphics_card}`,
  }));

  // Priority options
  const priorityData = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Urgent", value: "Urgent" },
  ];

  // ================== HELPERS ==================
  // Convert file size to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  };

  // Handle accepted files for upload
  const handleAcceptedFiles = (files) => {
    const mapped = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    );
    setSelectedFiles((prev) => [...prev, ...mapped]);
    setFormData((prev) => ({
      ...prev,
      repair_image: [...prev.repair_image, ...files],
    }));
  };

  // Remove file from state
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      repair_image: prev.repair_image.filter((_, i) => i !== index),
    }));
  };

  // Handle form input change
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrorMessage((prev) => ({ ...prev, [key]: "" }));
  };

  // Toggle between tabs
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // ================== MODALS STATES ==================
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeviceTypeModalOpen, setIsDeviceTypeModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isDeviceModelModalOpen, setIsDeviceModelModalOpen] = useState(false);
  const [isDeviceColorModalOpen, setIsDeviceColorModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [
    isHardwareConfigurationModalOpen,
    setIsHardwareConfigurationModalOpen,
  ] = useState(false);

  // ================== FORM VALIDATION ==================
  const validateForm = () => {
    const errors = {};
    const f = formData;

    if (!f.repair_customer_id)
      errors.repair_customer_id = "Please select a customer.";
    else if (!f.repair_service_type_id)
      errors.repair_service_type_id = "Please select a service type.";
    else if (!f.repair_type_id)
      errors.repair_type_id = "Please select a repair type.";
    else if (!f.repair_device_type_id)
      errors.repair_device_type_id = "Please select a device type.";
    else if (!f.repair_device_brand_id)
      errors.repair_device_brand_id = "Please select a device brand.";
    else if (!f.repair_device_services_id?.length)
      errors.repair_device_services_id = "Please select at least one service.";
    else if (!f.repair_device_priority?.trim())
      errors.repair_device_priority = "Please select a device priority.";

    setErrorMessage(errors);
    return Object.keys(errors).length === 0;
  };

  // ================== SUBMIT HANDLER ==================
  const AddHandler = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalData={
      ...formData,
      repair_device_services_id:JSON.stringify(formData.repair_device_services_id)
    };
    
    dispatch(addRepair(finalData));
  };

  // ================== WORKFLOW HANDLING ==================
  useEffect(() => {
    if (workflows.length > 0 && !formData.repair_workflow_id) {
      const defaultWorkflowId = workflows[0].workflow_id;
      setFormData((prev) => ({
        ...prev,
        repair_workflow_id: defaultWorkflowId,
      }));
      dispatch(getWorkflowStageList(defaultWorkflowId));
    }

    if (formData.repair_workflow_id) {
      dispatch(getWorkflowStageList(formData.repair_workflow_id));
    }

    if (workflowStages.length > 0 && !formData.repair_workflow_stage_id) {
      setFormData((prev) => ({
        ...prev,
        repair_workflow_stage_id: workflowStages[0].workflow_child_id,
      }));
    }
  }, [workflows, workflowStages, formData.repair_workflow_id, dispatch]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Add Repair Inquiry
      </ModalHeader>

      <form onSubmit={AddHandler}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            {/* Tabs */}
            <Nav className="nav-tabs nav-tabs-custom nav-success p-2 pb-0 bg-light">
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  Basic Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                >
                  Device Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => toggleTab("3")}
                >
                  Service Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "4" })}
                  onClick={() => toggleTab("4")}
                >
                  Additional Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({ active: activeTab === "5" })}
                  onClick={() => toggleTab("5")}
                >
                  Repair Gallery
                </NavLink>
              </NavItem>
            </Nav>

            <ModalBody>
              <TabContent activeTab={activeTab}>
                {/* TAB 1 */}
                <TabPane tabId="1">
                  <RepairTabBasicInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    customerOptions={customerOptions}
                    SourceOptions={SourceOptions}
                    serviceTypesOption={serviceTypesOption}
                    repairTypesOption={repairTypesOption}
                    setIsCustomerModalOpen={setIsCustomerModalOpen}
                    errorMessage={errorMessage}
                  />
                </TabPane>

                <TabPane tabId="2">
                  <RepairTabDeviceInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
                    deviceTypesOption={deviceTypesOption}
                    brandsOption={brandsOption}
                    deviceModelsOption={deviceModelsOption}
                    accessoriesOption={accessoriesOption}
                    storageLocationsOption={storageLocationsOption}
                    deviceColorsOption={deviceColorsOption}
                    setIsDeviceTypeModalOpen={setIsDeviceTypeModalOpen}
                    setIsBrandModalOpen={setIsBrandModalOpen}
                    setIsDeviceModelModalOpen={setIsDeviceModelModalOpen}
                    setIsDeviceColorModalOpen={setIsDeviceColorModalOpen}
                  />
                </TabPane>

                <TabPane tabId="3">
                  <RepairTabServiceInfo
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
                    servicesOption={servicesOption}
                    hardwareConfigurationsOption={hardwareConfigurationsOption}
                    setIsServicesModalOpen={setIsServicesModalOpen}
                    setIsHardwareConfigurationModalOpen={
                      setIsHardwareConfigurationModalOpen
                    }
                  />
                </TabPane>

                <TabPane tabId="4">
                  <RepairTabAdditionalInfo
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
                    priorityData={priorityData}
                    technicianOptions={technicianOptions}
                    workflowOption={workflowOption}
                    workfloStagewOption={workfloStagewOption}
                    deliveryOptions={deliveryOptions}
                    formatDateTime={formatDateTime}
                  />
                </TabPane>
                <TabPane tabId="5">
                  <RepairTabGallery
                    handleAcceptedFiles={handleAcceptedFiles}
                    selectedFiles={selectedFiles}
                    removeFile={removeFile}
                  />
                </TabPane>
              </TabContent>
            </ModalBody>

            <ModalFooter>
              <div className="hstack gap-2 justify-content-center mt-2">
                <Button color="danger" type="button" onClick={toggle}>
                  <i className="ri-close-line me-1 align-middle" />
                  Close
                </Button>
                <Button color="primary" type="submit">
                  <i className="ri-save-3-line align-bottom me-1"></i>
                  Save
                </Button>
              </div>
            </ModalFooter>
          </Card>
        </div>
      </form>

      {isCustomerModalOpen && (
        <CustomerAdd
          isOpen={isCustomerModalOpen}
          toggle={() => setIsCustomerModalOpen(false)}
        />
      )}

      {isDeviceTypeModalOpen && (
        <DeviceTypeAdd
          isOpen={isDeviceTypeModalOpen}
          toggle={() => setIsDeviceTypeModalOpen(false)}
        />
      )}
      {isBrandModalOpen && (
        <BrandAdd
          isOpen={isBrandModalOpen}
          toggle={() => setIsBrandModalOpen(false)}
        />
      )}
      {isDeviceModelModalOpen && (
        <DeviceModelAdd
          isOpen={isDeviceModelModalOpen}
          toggle={() => setIsDeviceModelModalOpen(false)}
        />
      )}
      {isDeviceColorModalOpen && (
        <DeviceColorAdd
          isOpen={isDeviceColorModalOpen}
          toggle={() => setIsDeviceColorModalOpen(false)}
        />
      )}
      {isServicesModalOpen && (
        <ServiceAdd
          isOpen={isServicesModalOpen}
          toggle={() => setIsServicesModalOpen(false)}
        />
      )}
      {isHardwareConfigurationModalOpen && (
        <HardwareConfigurationAdd
          isOpen={isHardwareConfigurationModalOpen}
          toggle={() => setIsHardwareConfigurationModalOpen(false)}
        />
      )}
    </Modal>
  );
};

export default RepairingAdd;
