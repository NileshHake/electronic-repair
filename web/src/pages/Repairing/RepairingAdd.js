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
import { useDispatch, useSelector } from "react-redux";

import { addRepair, resetAddRepairResponse } from "../../store/Repairing";

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
    repair_expected_delivery_date: null,
    repair_assigned_technician_to: "",
    repair_delivery_and_pickup_to: "",
    repair_device_serial_number: "",
    repair_device_accessories_id: "",
    repair_device_services_id: [{ service: "", cost: "" }],
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

  const addRepairResponse = useSelector(
    (state) => state.RepairReducer?.addRepairResponse
  );

  // ================== SUCCESS HANDLER ==================
  useEffect(() => {
    if (addRepairResponse) {
      toggle(); // Close modal after successful add
      dispatch(resetAddRepairResponse());
      setSelectedFiles([]);
      setErrorMessage({});
    }
  }, [addRepairResponse, dispatch, toggle]);

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

    // first calculate the total
    const repair_estimated_cost = formData.repair_device_services_id.reduce(
      (total, item) => total + (Number(item.cost) || 0),
      0
    );

    // then build finalData
    const finalData = {
      ...formData,
      repair_device_services_id: JSON.stringify(
        formData.repair_device_services_id
      ),
      repair_estimated_cost, // same as repair_estimated_cost: repair_estimated_cost
    };

    dispatch(addRepair(finalData));
  };

  // ================== WORKFLOW HANDLING ==================

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
    </Modal>
  );
};

export default RepairingAdd;
