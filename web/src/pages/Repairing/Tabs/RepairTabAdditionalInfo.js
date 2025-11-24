import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { getTechniciansList } from "../../../store/Technician";
import { getDeliveryBoysList } from "../../../store/DeliveryAndPickUpBoy";
import { getWorkflowList, getWorkflowStageList } from "../../../store/Workflow";
import { formatDateTime } from "../../../helpers/date_and_time_format";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const RepairTabAdditionalInfo = ({
  formData,
  handleInputChange,
  errorMessage,
  setFormData,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    [getWorkflowList, getTechniciansList, getDeliveryBoysList].forEach(
      (action) => dispatch(action())
    );
  }, [dispatch]);

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
  const mapOptions = (list, valueKey, labelKey) =>
    list.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));
  const technicianOptions = mapOptions(technicianList, "user_id", "user_name");
  const deliveryOptions = mapOptions(deliveryBoyList, "user_id", "user_name");
  const workflowOption = mapOptions(workflows, "workflow_id", "workflow_name");

  const workfloStagewOption = mapOptions(
    workflowStages,
    "workflow_child_id",
    "workflow_stage_name"
  );
  const priorityData = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Urgent", value: "Urgent" },
  ];
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
    <Row>
      {/* Priority */}
      <Col md={4}>
        <Label>
          Priority <span className="text-danger">*</span>
        </Label>
        <Select
          value={priorityData.find(
            (opt) => opt.value === formData.repair_device_priority
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_priority", opt.value)
          }
          options={priorityData}
          placeholder="Select Priority"
        />
        {errorMessage.repair_device_priority && (
          <span className="text-danger small">
            {errorMessage.repair_device_priority}
          </span>
        )}
      </Col>

      {/* Technician */}
      <Col md={4}>
        <Label>Technician</Label>
        <Select
          value={technicianOptions.find(
            (opt) => opt.value === formData.repair_assigned_technician_to
          )}
          onChange={(opt) =>
            handleInputChange("repair_assigned_technician_to", opt.value)
          }
          options={technicianOptions}
          placeholder="Select Technician"
        />
        {errorMessage.repair_assigned_technician_to && (
          <span className="text-danger small">
            {errorMessage.repair_assigned_technician_to}
          </span>
        )}
      </Col>
      <Col md={4} className=" ">
        <Label> Estimated Cost</Label>
        <Input
          value={formData.repair_estimated_cost}
          onChange={(e) =>
            handleInputChange("repair_estimated_cost", e.target.value)
          }
          className="form-control"
          placeholder="Enter Serial / IMEI Number"
        />
      </Col>
      {/* Workflow */}
      <Col md={4} className="mt-4">
        <Label>Work Flow</Label>
        <Select
          value={workflowOption.find(
            (opt) => opt.value === formData.repair_workflow_id
          )}
          onChange={(opt) => handleInputChange("repair_workflow_id", opt.value)}
          options={workflowOption}
          placeholder="Select Workflow"
        />
      </Col>

      {/* Work Stage */}
      <Col md={4} className="mt-3">
        <Label>Work Stage</Label>
        <Select
          value={workfloStagewOption.find(
            (opt) => opt.value === formData.repair_workflow_stage_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_workflow_stage_id", opt.value)
          }
          options={workfloStagewOption}
          placeholder="Select Work Stage"
        />
      </Col>

      {/* Delivery / Pickup Boy */}
      <Col md={4} className="mt-3">
        <Label>Delivery / PickUp Boy</Label>
        <Select
          value={deliveryOptions.find(
            (opt) => opt.value === formData.repair_delivery_and_pickup_to
          )}
          onChange={(opt) =>
            handleInputChange("repair_delivery_and_pickup_to", opt.value)
          }
          options={deliveryOptions}
          placeholder="Select Delivery/Pickup Boy"
        />
      </Col>

      {/* Expected Delivery Date */}
      {/* Expected Delivery Date */}
      <Col md={4} className="mt-3">
        <Label>Expected Delivery Date</Label>
        <Input
          type="date"
          className="form-control"
          value={formData.repair_expected_delivery_date || ""}
          onChange={(e) =>
            handleInputChange(
              "repair_expected_delivery_date",
              e.target.value // "YYYY-MM-DD"
            )
          }
        />
      </Col>
    </Row>
  );
};

export default RepairTabAdditionalInfo;
