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

  // 🔹 Calculate estimated cost from servicesArray
   formData.repair_estimated_cost = servicesArray.reduce(
    (total, item) => total + (Number(item.cost) || 0),
    0
  );

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
        formDataToSend.append(
          "repair_device_services_id",
          JSON.stringify(service)
        );
      });
    } else {
      formDataToSend.append(key, formData[key]);
    }
  }
 

  dispatch(updateRepair(formDataToSend));
};

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
                    errorMessage={errorMessage}
                  />
                </TabPane>

                <TabPane tabId="2">
                  <RepairTabDeviceInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
                  />
                </TabPane>

                <TabPane tabId="3">
                  <RepairTabServiceInfo
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
                  />
                </TabPane>

                <TabPane tabId="4">
                  <RepairTabAdditionalInfo
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    errorMessage={errorMessage}
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
    </Modal>
  );
};

export default RepairingUpdate;
