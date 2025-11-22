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
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Flatpickr from "react-flatpickr";
import Dropzone from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { getProductList } from "../../store/product/index";
import { getCustomerList } from "../../store/Customer";
import { getTechniciansList } from "../../store/Technician";
import { getDeliveryBoysList } from "../../store/DeliveryAndPickUpBoy";
import {
  updateRepair,
  getRepairList,
  resetUpdateRepairResponse,
} from "../../store/Repairing";
import { formatDateTime } from "../../helpers/date_and_time_format";
import { api } from "../../config";
import { getWorkflowList, getWorkflowStageList } from "../../store/Workflow";
import { getServicesList } from "../../store/Service";
import { getServiceTypeList } from "../../store/ServiceType";
import { getHardwareConfigurations } from "../../store/HardwareConfiguration";
import { getDeviceColorList } from "../../store/DeviceColor";
import { getStorageLocationsList } from "../../store/StorageLocation";
import { getAccessoriesList } from "../../store/Accessories";
import { getDeviceTypesList } from "../../store/DeviceType";
import { getDeviceModelsList } from "../../store/DeviceModel";
import { getRepairTypesList } from "../../store/RepairType";
import { getSourcesList } from "../../store/Source";
import { getBrandsList } from "../../store/Brand";
import RepairTabBasicInfo from "./Tabs/RepairTabBasicInfo";
import HardwareConfigurationAdd from "../HardwareConfiguration/HardwareConfigurationAdd";
import ServiceAdd from "../Services/ServiceAdd";
import DeviceColorAdd from "../DeviceColor/DeviceColorAdd";
import DeviceModelAdd from "../DeviceModel/DeviceModelAdd";
import BrandAdd from "../Brand/BrandAdd";
import DeviceTypeAdd from "../DeviceType/DeviceTypeAdd";
import CustomerAdd from "../Customer/CustomerAdd";
import RepairTabAdditionalInfo from "./Tabs/RepairTabAdditionalInfo";
import RepairTabServiceInfo from "./Tabs/RepairTabServiceInfo";
import RepairTabDeviceInfo from "./Tabs/RepairTabDeviceInfo";

const RepairingUpdate = ({ isOpen, toggle, isRepairData }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("1");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});

  // ================== PREFILL FORM ==================
  const [formData, setFormData] = useState(isRepairData);

  useEffect(() => {
    if (isRepairData) {
      let existingImages = [];
      try {
        existingImages = JSON.parse(isRepairData.repair_image || "[]");
      } catch {
        existingImages = [];
      }

      const existingPreviews = existingImages.map((imgName, idx) => ({
        name: imgName,
        preview: `${api.IMG_URL}repair_images/${imgName}`,
        formattedSize: "Existing File",
        isExisting: true,
      }));

      setSelectedFiles(existingPreviews);

      setFormData({
        ...formData,
        repair_images: existingImages.map((img) => ({
          type: "existing",
          name: img,
        })),
      });
    }
  }, [isRepairData]);
  const {
    ProductReducer,
    CustomerReducer,
    TechnicianReducer,
    DeliveryBoyReducer,
    WorkflowReducer,
    RepairReducer,
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

  const customerList =
    CustomerReducer?.customerList?.data || CustomerReducer?.customerList || [];
  const technicianList = TechnicianReducer?.technicians || [];
  const deliveryBoyList = DeliveryBoyReducer?.deliveryBoys || [];
  const { workflows = [], workflowStages = [] } = WorkflowReducer;
  const addRepairResponse = RepairReducer?.addRepairResponse;
  const { sources } = SourceReducer;
  const { repairTypes } = RepairTypeReducer;
  const { deviceTypes } = DeviceTypeReducer;
  const { serviceTypes } = ServiceTypeReducer;
  const { brands } = BrandReducer;
  const { deviceModels } = DeviceModelReducer;
  const { accessories } = AccessoriesReducer;
  const { storageLocations } = StorageLocationReducer;
  const { deviceColors = [] } = DeviceColorReducer;
  const { services } = ServiceReducer;
  const { hardwareConfigurations = [] } = HardwareConfigurationReducer || {};

  // ================== INITIAL DATA FETCH ==================
  useEffect(() => {
    // Fetch all necessary lists in one go
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

  const updateRepairResponse = useSelector(
    (state) => state.RepairReducer?.updateRepairResponse
  );
  useEffect(() => {
    if (updateRepairResponse) {
      toggle();
      dispatch(resetUpdateRepairResponse());
      dispatch(getRepairList());
    }
  }, [updateRepairResponse]);
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

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleAcceptedFiles = (files) => {
    const newFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
        isExisting: false,
      })
    );

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    setFormData((prev) => ({
      ...prev,
      repair_images: [
        ...prev.repair_images,
        ...newFiles.map((file) => ({
          type: "new",
          file,
        })),
      ],
    }));
  };

  const removeFile = (index) => {
    const removedFile = selectedFiles[index];
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    setSelectedFiles(updatedFiles);

    setFormData((prev) => ({
      ...prev,
      repair_images: prev.repair_images.filter((img, i) => {
        if (removedFile.isExisting) {
          return img.name !== removedFile.preview.split("/").pop();
        } else {
          return i !== index;
        }
      }),
    }));
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setErrorMessage((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
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

const UpdateHandler = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const servicesArray = Array.isArray(formData.repair_device_services_id)
    ? formData.repair_device_services_id
    : (() => {
        try {
          const parsed = JSON.parse(formData.repair_device_services_id);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

  const formDataToSend = new FormData();

  for (const key in formData) {
    if (key === "repair_images" && Array.isArray(formData.repair_images)) {
      formData.repair_images.forEach((img) => {
        if (img.type === "existing" && img.name) {
          formDataToSend.append("old_images[]", img.name);
        } else if (img.type === "new" && img.file instanceof File) {
          formDataToSend.append("repair_images[]", img.file);
        }
      });
    } else if (key === "repair_device_services_id") {
      servicesArray.forEach((service) => {
        // append each service object as JSON string
        formDataToSend.append(
          "repair_device_services_id",
          JSON.stringify(service)
        );
      });
    } else {
      formDataToSend.append(key, formData[key]);
    }
  }

  console.log("FormData ready to send:", formDataToSend);
  dispatch(updateRepair(formDataToSend));
};

  useEffect(() => {
    if (workflows.length > 0 && !formData.repair_workflow_id) {
      setFormData((prev) => ({
        ...prev,
        repair_workflow_id: workflows[0].workflow_id,
      }));
    }
    if (formData.repair_workflow_id) {
      dispatch(getWorkflowStageList(formData.repair_workflow_id));
    }
  }, [workflows, formData.repair_workflow_id]);
  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Update Repair Inquiry
      </ModalHeader>

      <form onSubmit={UpdateHandler}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
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
                  <Row>
                    <Col lg={12}>
                      <Card className="mb-4">
                        <CardBody>
                          <h5 className="fs-15 mb-1">Repair Gallery</h5>
                          <p className="text-muted">
                            Add or remove images for this repair.
                          </p>

                          <Dropzone onDrop={handleAcceptedFiles}>
                            {({ getRootProps, getInputProps }) => (
                              <div
                                className="dropzone dz-clickable"
                                {...getRootProps()}
                              >
                                <div className="dz-message needsclick">
                                  <div className="mb-3">
                                    <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                  </div>
                                  <h5>Drop files here or click to upload.</h5>
                                </div>
                                <input {...getInputProps()} />
                              </div>
                            )}
                          </Dropzone>

                          <div className="mt-4">
                            <h6 className="text-muted mb-3">Preview Gallery</h6>
                            <Row className="g-3">
                              {selectedFiles.map((file, i) => (
                                <Col key={i} xs="6" sm="4" md="3" lg="2">
                                  <Card className="shadow-sm border-0 h-100">
                                    <div className="position-relative">
                                      <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="img-fluid rounded-top"
                                        style={{
                                          width: "100%",
                                          height: "150px",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <div
                                        className="position-absolute top-0 end-0 m-1 bg-white rounded-circle shadow-sm"
                                        style={{
                                          width: "25px",
                                          height: "25px",
                                          cursor: "pointer",
                                        }}
                                        title="Remove Image"
                                        onClick={() => removeFile(i)}
                                      >
                                        <i
                                          className="ri-close-line text-danger d-flex justify-content-center align-items-center"
                                          style={{
                                            fontSize: "16px",
                                            height: "100%",
                                          }}
                                        ></i>
                                      </div>
                                    </div>
                                    <div className="p-2 text-center">
                                      <p
                                        className="mb-0 fw-semibold text-truncate"
                                        title={file.name}
                                      >
                                        {file.name}
                                      </p>
                                      <small className="text-muted">
                                        {file.formattedSize}
                                      </small>
                                    </div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
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
                  Update
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

export default RepairingUpdate;
