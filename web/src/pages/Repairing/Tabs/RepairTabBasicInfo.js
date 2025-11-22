import React from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";

const RepairTabBasicInfo = ({
  formData,
  handleInputChange,
  customerOptions,
  SourceOptions,
  repairTypesOption,
  serviceTypesOption,
  setIsCustomerModalOpen,
  errorMessage
}) => {
  return (
    <Row>
      <Col md={4}>
        <div className="d-flex justify-content-between align-items-center">
          <Label className="mb-0">
            Select Customer <span className="text-danger">*</span>
          </Label>
          <span
            role="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={customerOptions.find(
            (opt) => opt.value === formData.repair_customer_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_customer_id", opt.value)
          }
          options={customerOptions}
          placeholder="Select Customer"
        />
        {errorMessage.repair_customer_id && (
          <span className="text-danger small">
            {errorMessage.repair_customer_id}
          </span>
        )}
      </Col>

      <Col md={4} className="mt-2">
        <Label>Source</Label>
        <Select
          value={SourceOptions.find(
            (opt) => opt.value === formData.repair_source_id
          )}
          onChange={(opt) => handleInputChange("repair_source_id", opt.value)}
          options={SourceOptions}
          placeholder="Select Source"
        />
      </Col>

      <Col md={4}>
        <Label className="mt-2">Referred By</Label>
        <Select
          value={customerOptions.find(
            (opt) => opt.value === formData.repair_referred_by_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_referred_by_id", opt.value)
          }
          options={customerOptions}
          placeholder="Select Referred By"
        />
      </Col>

      <Col md={4} className="mt-3">
        <Label>
          Service Type <span className="text-danger">*</span>
        </Label>
        <Select
          value={serviceTypesOption.find(
            (opt) => opt.value === formData.repair_service_type_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_service_type_id", opt.value)
          }
          options={serviceTypesOption}
          placeholder="Select Service Type"
        />
        {errorMessage.repair_service_type_id && (
          <span className="text-danger small">
            {errorMessage.repair_service_type_id}
          </span>
        )}
      </Col>

      <Col md={4} className="mt-3">
        <Label>
          Repair Type <span className="text-danger">*</span>
        </Label>
        <Select
          value={repairTypesOption.find(
            (opt) => opt.value === formData.repair_type_id
          )}
          onChange={(opt) => handleInputChange("repair_type_id", opt.value)}
          options={repairTypesOption}
          placeholder="Select Repair Type"
        />
        {errorMessage.repair_type_id && (
          <span className="text-danger small">
            {errorMessage.repair_type_id}
          </span>
        )}
      </Col>
    </Row>
  );
};

export default RepairTabBasicInfo;
