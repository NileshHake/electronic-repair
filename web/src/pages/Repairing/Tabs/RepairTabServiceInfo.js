import React, { useMemo } from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import AuthUser from "../../../helpers/AuthType/AuthUser";

const findOption = (opts, id) =>
  opts.find((o) => String(o.value) === String(id)) || null;

const ensureServicesArray = (v) => {
  if (Array.isArray(v) && v.length) return v;
  return [{ service: "", cost: "" }];
};

const RepairTabServiceInfo = ({ form, lookups }) => {
  const { user } = AuthUser();

  const { formData, setFormData, setField, errorMessage } = form;

  const { hardwareConfigurations = [] } = lookups?.data || {};

  // ✅ options
  const hardwareConfigurationsOption = useMemo(
    () =>
      (hardwareConfigurations || []).map((w) => ({
        value: w.hardware_configuration_id,
        label: `${w.hardware_configuration_processor} | ${w.hardware_configuration_ram} | ${w.hardware_configuration_hard_disk} | ${w.hardware_configuration_ssd} | ${w.hardware_configuration_graphics_card}`,
      })),
    [hardwareConfigurations]
  );

  // ✅ local helpers (update services rows)
  const addServiceRow = () => {
    setFormData((prev) => {
      const services = ensureServicesArray(prev.repair_device_services_id);
      return {
        ...prev,
        repair_device_services_id: [...services, { service: "", cost: "" }],
      };
    });
  };

  const removeServiceRow = (index) => {
    setFormData((prev) => {
      const services = ensureServicesArray(prev.repair_device_services_id);
      const updated = services.filter((_, i) => i !== index);
      return {
        ...prev,
        repair_device_services_id:
          updated.length > 0 ? updated : [{ service: "", cost: "" }],
      };
    });
  };

  const updateServiceRow = (index, field, value) => {
    setFormData((prev) => {
      const services = ensureServicesArray(prev.repair_device_services_id);
      const updated = [...services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, repair_device_services_id: updated };
    });
  };

  const servicesRows = ensureServicesArray(formData.repair_device_services_id);

  return (
    <Row>
      {/* ✅ Services */}
      <Col md={6}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>
            Services <span className="text-danger">*</span>
          </Label>

          <span
            role="button"
            onClick={addServiceRow}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        {servicesRows.map((row, index) => (
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
            {user?.user_type != 6 && (
              <input
                type="number"
                className="form-control"
                placeholder="Cost"
                value={row.cost || ""}
                onChange={(e) => updateServiceRow(index, "cost", e.target.value)}
              />
            )}

            {/* Remove */}
            {servicesRows.length > 1 && (
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

        {errorMessage?.repair_device_services_id && (
          <span className="text-danger small">
            {errorMessage.repair_device_services_id}
          </span>
        )}
      </Col>

      {/* ✅ Hardware Configuration */}
      <Col md={6}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>Hardware Configuration</Label>
          <span
            role="button"
            onClick={() => lookups.ui.setIsHardwareConfigOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        <Select
          value={findOption(
            hardwareConfigurationsOption,
            formData.repair_device_hardware_configuration_id
          )}
          options={hardwareConfigurationsOption}
          placeholder="Select Hardware Configuration"
          onChange={(opt) =>
            setField(
              "repair_device_hardware_configuration_id",
              opt?.value || 0
            )
          }
        />
      </Col>

      {/* ✅ Problem Description */}
      <Col lg={12} className="mt-3">
        <Label>Problem Description</Label>
        <CKEditor
          editor={ClassicEditor}
          data={formData.repair_problem_description || ""}
          onChange={(event, editor) =>
            setField("repair_problem_description", editor.getData())
          }
        />
      </Col>
    </Row>
  );
};

export default RepairTabServiceInfo;
