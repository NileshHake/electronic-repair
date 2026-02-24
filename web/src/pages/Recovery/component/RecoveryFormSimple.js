/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useEffect } from "react";
import { Row, Col, Label, CardBody } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import RecoveryGallery from "./RecoveryGallery";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const findOption = (opts, id) =>
  (opts || []).find((o) => String(o.value) === String(id)) || null;

const RecoveryFormSimple = ({ form, lookups }) => {
  const { user } = AuthUser();
  const { formData, setField, errorMessage } = form;

  const {
    customers = [],
    workflows = [],
    workflowStages = [],
  } = lookups?.data || {};

  // ✅ Customer options
  const customerOptions = useMemo(
    () =>
      (customers || []).map((c) => ({
        value: String(c.user_id), // ✅ keep as string for consistent matching
        label: c.user_name,
      })),
    [customers]
  );

  // ✅ Workflow options
  const workflowOptions = useMemo(
    () =>
      (workflows || []).map((w) => ({
        value: Number(w.workflow_id),
        label: w.workflow_name,
      })),
    [workflows]
  );

  // ✅ Stage options
  const stageOptions = useMemo(
    () =>
      (workflowStages || []).map((s) => ({
        value: Number(s.workflow_child_id),
        label: s.workflow_stage_name,
      })),
    [workflowStages]
  );

  // ✅ when workflow changes -> fetch stages
  useEffect(() => {
    const wid = Number(formData.recovery_workflow_id || 0);
    if (wid) lookups?.fetchWorkflowStages?.(wid);
  }, [formData.recovery_workflow_id]);

  // ✅ when stages loaded -> ensure a stage is selected
  useEffect(() => {
    if (!workflowStages?.length) return;

    const current = Number(formData.recovery_workflow_stage_id || 0);
    const exists = workflowStages.some(
      (s) => Number(s.workflow_child_id) === current
    );

    if (!current || !exists) {
      setField("recovery_workflow_stage_id", workflowStages[0].workflow_child_id);
    }
  }, [workflowStages]);

  return (
    <CardBody>
      <Row className="g-3">
        {/* ✅ Customer (only if user_type != 6) */}
        {user?.user_type != 6 && (
          <Col md={4}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Label className="mb-0">
                Select Customer <span className="text-danger">*</span>
              </Label>

              <span
                role="button"
                onClick={() => lookups?.ui?.setIsCustomerOpen?.(true)}
                className="text-success fw-bold"
                style={{
                  fontSize: "22px",
                  cursor: "pointer",
                  userSelect: "none",
                  lineHeight: 1,
                }}
                title="Add Customer"
              >
                +
              </span>
            </div>

            <Select
              value={findOption(
                customerOptions,
                String(formData.recovery_customer_id || "")
              )}
              options={customerOptions}
              placeholder="Select Customer"
              onChange={(opt) =>
                setField("recovery_customer_id", opt?.value || "")
              }
            />

            {errorMessage?.recovery_customer_id && (
              <span className="text-danger small">
                {errorMessage.recovery_customer_id}
              </span>
            )}
          </Col>
        )}

        {/* ✅ Workflow */}
        <Col md={4}>
          <Label className="mb-1">Workflow</Label>

          <Select
            value={findOption(workflowOptions, formData.recovery_workflow_id)}
            options={workflowOptions}
            placeholder="Select Workflow"
            onChange={(opt) => {
              const wid = Number(opt?.value || 0);
              setField("recovery_workflow_id", wid);
              setField("recovery_workflow_stage_id", 0); // reset stage
            }}
          />
        </Col>

        {/* ✅ Stage */}
        <Col md={4}>
          <Label className="mb-1">Stage</Label>

          <Select
            value={findOption(stageOptions, formData.recovery_workflow_stage_id)}
            options={stageOptions}
            placeholder="Select Stage"
            isDisabled={!Number(formData.recovery_workflow_id || 0)}
            onChange={(opt) =>
              setField("recovery_workflow_stage_id", Number(opt?.value || 0))
            }
          />

          {errorMessage?.recovery_workflow_stage_id && (
            <span className="text-danger small">
              {errorMessage.recovery_workflow_stage_id}
            </span>
          )}
        </Col>

        {/* ✅ Problem Description (CKEditor) */}
        <Col md={6}>
          <Label className="mb-1">
            Problem Description <span className="text-danger">*</span>
          </Label>

          <div className="border rounded">
            <CKEditor
              editor={ClassicEditor}
              data={formData.recovery_problem_description || ""}
              onChange={(event, editor) => {
                const data = editor.getData();
                setField("recovery_problem_description", data);
              }}
            />
          </div>

          {errorMessage?.recovery_problem_description && (
            <span className="text-danger small">
              {errorMessage.recovery_problem_description}
            </span>
          )}
        </Col>

        {/* ✅ Gallery (Optional Images) */}
        <Col md={6}>
          <RecoveryGallery form={form} />
        </Col>
      </Row>
    </CardBody>
  );
};

export default RecoveryFormSimple;