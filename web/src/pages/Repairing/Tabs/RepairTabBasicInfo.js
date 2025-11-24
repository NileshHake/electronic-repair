import React from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { getServicesList } from "../../../store/Service";
import { getCustomerList } from "../../../store/Customer";
import { getSourcesList } from "../../../store/Source";
import { getServiceTypeList } from "../../../store/ServiceType";
import { getRepairTypesList } from "../../../store/RepairType";
import { useState } from "react";
import { useEffect } from "react";
import CustomerAdd from "../../Customer/CustomerAdd";

const RepairTabBasicInfo = ({ formData, handleInputChange, errorMessage }) => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    [
      getServiceTypeList,

      getCustomerList,

      getRepairTypesList,
      getSourcesList,
    ].forEach((action) => dispatch(action()));
  }, [dispatch]);
  const customerList = useSelector(
    (state) =>
      state.CustomerReducer?.customerList?.data ||
      state.CustomerReducer?.customerList ||
      []
  );
  const serviceTypes = useSelector(
    (state) => state.ServiceTypeReducer?.serviceTypes
  );
  const sources = useSelector((state) => state.SourceReducer?.sources);
  const repairTypes = useSelector(
    (state) => state.RepairTypeReducer?.repairTypes
  );
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
  const SourceOptions = mapOptions(sources, "source_id", "source_name");
  const serviceTypesOption = mapOptions(
    serviceTypes,
    "service_type_id",
    "service_type_name"
  );
  const repairTypesOption = mapOptions(
    repairTypes,
    "repair_type_id",
    "repair_type_name"
  );
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
          onChange={(opt) => handleInputChange("repair_customer_id", opt.value)}
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
      {isCustomerModalOpen && (
        <CustomerAdd
          isOpen={isCustomerModalOpen}
          toggle={() => setIsCustomerModalOpen(false)}
        />
      )}
    </Row>
  );
};

export default RepairTabBasicInfo;
