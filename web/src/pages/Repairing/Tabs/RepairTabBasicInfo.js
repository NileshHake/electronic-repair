import React, { useMemo } from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const findOption = (opts, id) =>
  opts.find((o) => String(o.value) === String(id)) || null;

const RepairTabBasicInfo = ({ form, lookups }) => {
  const { user } = AuthUser();

  const { formData, setField, errorMessage } = form;

  const {
    customers = [],
    sources = [],
    repairTypes = [],
    serviceTypes = [],
  } = lookups?.data || {};

  // ✅ Options (memo for performance)
  const customerOptions = useMemo(
    () =>
      (customers || []).map((c) => ({
        value: c.user_id,
        label: c.user_name,
      })),
    [customers]
  );

  const sourceOptions = useMemo(
    () =>
      (sources || []).map((s) => ({
        value: s.source_id,
        label: s.source_name,
      })),
    [sources]
  );

  const repairTypesOption = useMemo(
    () =>
      (repairTypes || []).map((r) => ({
        value: r.repair_type_id,
        label: r.repair_type_name,
      })),
    [repairTypes]
  );

  const serviceTypesOption = useMemo(
    () =>
      (serviceTypes || []).map((st) => ({
        value: st.service_type_id,
        label: st.service_type_name,
      })),
    [serviceTypes]
  );

  return (
    <Row>
      {/* ✅ Customer (only if user_type != 6) */}
      {user?.user_type != 6 && (
        <Col md={4}>
          <div className="d-flex justify-content-between align-items-center">
            <Label className="mb-0">
              Select Customer <span className="text-danger">*</span>
            </Label>

            <span
              role="button"
              onClick={() => lookups.ui.setIsCustomerOpen(true)}
              className="text-success fw-bold me-2"
              style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
            >
              +
            </span>
          </div>

          <Select
            value={findOption(customerOptions, formData.repair_customer_id)}
            options={customerOptions}
            placeholder="Select Customer"
            onChange={(opt) => setField("repair_customer_id", opt?.value || "")}
          />

          {errorMessage?.repair_customer_id && (
            <span className="text-danger small">
              {errorMessage.repair_customer_id}
            </span>
          )}
        </Col>
      )}

      {/* ✅ Source */}
      <Col md={4} className="mt-2">
        <Label>Source</Label>
        <Select
          value={findOption(sourceOptions, formData.repair_source_id)}
          options={sourceOptions}
          placeholder="Select Source"
          onChange={(opt) => setField("repair_source_id", opt?.value || 0)}
        />
      </Col>

      {/* ✅ Referred By */}
      <Col md={4}>
        <Label className="mt-2">Referred By</Label>
        <Select
          value={findOption(customerOptions, formData.repair_referred_by_id)}
          options={customerOptions}
          placeholder="Select Referred By"
          onChange={(opt) => setField("repair_referred_by_id", opt?.value || 0)}
        />
      </Col>

      {/* ✅ Service Type */}
      <Col md={4} className={user?.user_type == 6 ? "mt-2" : "mt-3"}>
        <Label>
          Service Type <span className="text-danger">*</span>
        </Label>
        <Select
          value={findOption(serviceTypesOption, formData.repair_service_type_id)}
          options={serviceTypesOption}
          placeholder="Select Service Type"
          onChange={(opt) => setField("repair_service_type_id", opt?.value || 0)}
        />
        {errorMessage?.repair_service_type_id && (
          <span className="text-danger small">
            {errorMessage.repair_service_type_id}
          </span>
        )}
      </Col>

      {/* ✅ Repair Type */}
      <Col md={4} className="mt-3">
        <Label>
          Repair Type <span className="text-danger">*</span>
        </Label>
        <Select
          value={findOption(repairTypesOption, formData.repair_type_id)}
          options={repairTypesOption}
          placeholder="Select Repair Type"
          onChange={(opt) => setField("repair_type_id", opt?.value || 0)}
        />
        {errorMessage?.repair_type_id && (
          <span className="text-danger small">{errorMessage.repair_type_id}</span>
        )}
      </Col>
    </Row>
  );
};

export default RepairTabBasicInfo;
