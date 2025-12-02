import React from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const RepairTabServiceInfo = ({
  formData,
  setFormData,
  handleInputChange,
  errorMessage,
  servicesOption,
  hardwareConfigurationsOption,
  setIsServicesModalOpen,
  setIsHardwareConfigurationModalOpen,
}) => {
 const { user } = AuthUser()
    
// Helper: ensure repair_device_services_id is always an array
const getServicesArray = (services) => {
  if (!services) return [{ service: "", cost: "" }];
  if (Array.isArray(services)) return services;

  try {
    const parsed = JSON.parse(services);
    return Array.isArray(parsed) ? parsed : [{ service: "", cost: "" }];
  } catch (err) {
    return [{ service: "", cost: "" }];
  }
};

// Add a new service row
const addServiceRow = () => {
  setFormData((prev) => {
    const services = getServicesArray(prev.repair_device_services_id);
    return {
      ...prev,
      repair_device_services_id: [...services, { service: "", cost: "" }],
    };
  });
};

// Remove a row
const removeServiceRow = (index) => {
  setFormData((prev) => {
    const services = getServicesArray(prev.repair_device_services_id);
    const updated = services.filter((_, i) => i !== index);
    return {
      ...prev,
      repair_device_services_id:
        updated.length > 0 ? updated : [{ service: "", cost: "" }],
    };
  });
};

// Update a single field in a row
const updateServiceRow = (index, field, value) => {
  setFormData((prev) => {
    const services = getServicesArray(prev.repair_device_services_id);
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    return {
      ...prev,
      repair_device_services_id: updated,
    };
  });
};


  return (
    <Row>
      {/* Services */}
   <Col md={6}>
  <div className="d-flex justify-content-between align-items-center">
    <Label>
      Services <span className="text-danger">*</span>
    </Label>

    {/* Header + button: adds new row */}
    <span
      role="button"
      onClick={addServiceRow}
      className="text-success fw-bold me-2"
      style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
    >
      +
    </span>
  </div>
 

{/* Dynamic service rows */}
{getServicesArray(formData.repair_device_services_id).map((row, index) => (
  <div
    key={index}
    className="d-flex align-items-center mb-2"
    style={{ gap: "8px" }}
  >
    {/* Service name */}
    <input
      type="text"
      className="form-control"
      placeholder="Service name"
      value={row.service || ""}
      onChange={(e) => updateServiceRow(index, "service", e.target.value)}
    />

    {/* Cost */}
   {user.user_type != 6 &&  <input
      type="number"
      className="form-control"
      placeholder="Cost"
      value={row.cost || ""}
      onChange={(e) => updateServiceRow(index, "cost", e.target.value)}
    />
   }
    {/* Remove button only */}
    {getServicesArray(formData.repair_device_services_id).length > 1 && (
      <button
        type="button"
        onClick={() => removeServiceRow(index)}
        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center rounded-circle"
        style={{ width: "28px", height: "28px" }}
      >
        <i className="ri-delete-bin-5-fill fs-14"></i>
      </button>
    )}
  </div>
))}

  {errorMessage.repair_device_services_id && (
    <span className="text-danger small">
      {errorMessage.repair_device_services_id}
    </span>
  )}
</Col>


      {/* Hardware Configuration */}
      <Col md={6}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>Hardware Configuration</Label>
          <span
            role="button"
            onClick={() => setIsHardwareConfigurationModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={hardwareConfigurationsOption.find(
            (opt) =>
              opt.value === formData.repair_device_hardware_configuration_id
          )}
          onChange={(opt) =>
            handleInputChange(
              "repair_device_hardware_configuration_id",
              opt.value
            )
          }
          options={hardwareConfigurationsOption}
          placeholder="Select Hardware Configuration"
        />
      </Col>

      {/* Problem Description */}
      <Col lg={12} className="mt-3">
        <Label>Problem Description</Label>
        <CKEditor
          editor={ClassicEditor}
          data={formData.repair_problem_description}
          onChange={(event, editor) =>
            handleInputChange("repair_problem_description", editor.getData())
          }
        />
      </Col>
    </Row>
  );
};

export default RepairTabServiceInfo;
