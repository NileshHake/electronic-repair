import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const RepairTabAdditionalInfo = ({
  formData,
  handleInputChange,
  errorMessage,
  priorityData,
  technicianOptions,
  workflowOption,
  workfloStagewOption,
  deliveryOptions,
  formatDateTime,
}) => {
  const { user } = AuthUser()
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
      {user.user_type != 6 && <Col md={4}>
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
      </Col>}
      {user.user_type != 6 &&
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
        </Col>}
      {/* Workflow */}
      <Col md={4} className={user?.user_type == 6 ? "" : "mt-3"}>
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
      <Col md={4} className={user?.user_type == 6 ? "" : "mt-3"}>
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
      {user.user_type != 6 &&
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
        </Col>}

      {/* Expected Delivery Date */}
      <Col md={4} className="mt-3">
        <Label>Expected Delivery Date</Label>
        <Flatpickr
          className="form-control"
          data-enable-time
          options={{ dateFormat: "d/m/Y H:i" }}
          onChange={(dates) =>
            handleInputChange(
              "repair_expected_delivery_date",
              formatDateTime(dates[0])
            )
          }
        />
      </Col>
    </Row>
  );
};

export default RepairTabAdditionalInfo;
