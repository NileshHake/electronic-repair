import React, { useMemo } from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const findOption = (opts, id) =>
  opts.find((o) => String(o.value) === String(id)) || null;

const RepairTabAdditionalInfo = ({ form, lookups }) => {
  const { user } = AuthUser();
  const { formData, setField, errorMessage } = form;

  const { workflows = [], workflowStages = [], technicians = [], deliveryBoys = [] } =
    lookups.data || {};

  const workflowOption = useMemo(
    () =>
      (workflows || []).map((w) => ({
        value: w.workflow_id,
        label: w.workflow_name,
      })),
    [workflows]
  );

  const workfloStagewOption = useMemo(
    () =>
      (workflowStages || []).map((s) => ({
        value: s.workflow_child_id,
        label: s.workflow_stage_name,
      })),
    [workflowStages]
  );

  const technicianOptions = useMemo(
    () =>
      (technicians || []).map((t) => ({
        value: t.user_id,
        label: t.user_name,
      })),
    [technicians]
  );

  const deliveryOptions = useMemo(
    () =>
      (deliveryBoys || []).map((d) => ({
        value: d.user_id,
        label: d.user_name,
      })),
    [deliveryBoys]
  );

  const priorityData = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Urgent", value: "Urgent" },
  ];

  return (
    <Row>
      {/* Priority */}
      <Col md={4}>
        <Label>
          Priority <span className="text-danger">*</span>
        </Label>
        <Select
          value={findOption(priorityData, formData.repair_device_priority)}
          options={priorityData}
          placeholder="Select Priority"
          onChange={(opt) => setField("repair_device_priority", opt?.value || "")}
        />
        {errorMessage?.repair_device_priority && (
          <span className="text-danger small">{errorMessage.repair_device_priority}</span>
        )}
      </Col>

      {/* Technician */}
      {user.user_type !== 6 && (
        <Col md={4}>
          <Label>Technician</Label>
          <Select
            value={findOption(technicianOptions, formData.repair_assigned_technician_to)}
            options={technicianOptions}
            placeholder="Select Technician"
            onChange={(opt) => setField("repair_assigned_technician_to", opt?.value || "")}
          />
        </Col>
      )}

      {/* Estimated Cost */}
      {user.user_type !== 6 && (
        <Col md={4}>
          <Label>Estimated Cost</Label>
          <Input
            value={formData.repair_estimated_cost || ""}
            onChange={(e) => setField("repair_estimated_cost", e.target.value)}
            placeholder="Enter Estimated Cost"
          />
        </Col>
      )}

      {/* Workflow */}
      <Col md={4} className={user.user_type === 6 ? "mt-3" : "mt-3"}>
        <Label>Work Flow</Label>
        <Select
          value={findOption(workflowOption, formData.repair_workflow_id)}
          options={workflowOption}
          placeholder="Select Workflow"
          onChange={(opt) => {
            const wid = opt?.value || 0;
            setField("repair_workflow_id", wid);

            // ✅ IMPORTANT: reset stage + fetch stages
            setField("repair_workflow_stage_id", 0);
            lookups.fetchWorkflowStages(wid);
          }}
        />
      </Col>

      {/* Work Stage */}
      <Col md={4} className="mt-3">
        <Label>Work Stage</Label>
        <Select
          value={findOption(workfloStagewOption, formData.repair_workflow_stage_id)}
          options={workfloStagewOption}
          placeholder="Select Work Stage"
          onChange={(opt) => setField("repair_workflow_stage_id", opt?.value || 0)}
          isDisabled={!workfloStagewOption.length}
        />
      </Col>

      {/* Delivery / Pickup */}
      {user.user_type !== 6 && (
        <Col md={4} className="mt-3">
          <Label>Delivery / PickUp Boy</Label>
          <Select
            value={findOption(deliveryOptions, formData.repair_delivery_and_pickup_to)}
            options={deliveryOptions}
            placeholder="Select Delivery/Pickup Boy"
            onChange={(opt) => setField("repair_delivery_and_pickup_to", opt?.value || "")}
          />
        </Col>
      )}

      {/* Expected Delivery Date */}
      <Col md={4} className="mt-3">
        <Label>Expected Delivery Date</Label>
        <Flatpickr
          className="form-control"
          data-enable-time
          options={{ dateFormat: "d/m/Y H:i" }}
          value={formData.repair_expected_delivery_date || ""}
          onChange={(dates) => setField("repair_expected_delivery_date", dates?.[0] || null)}
        />
      </Col>
    </Row>
  );
};

export default RepairTabAdditionalInfo;
