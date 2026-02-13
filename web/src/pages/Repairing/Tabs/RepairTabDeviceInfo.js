import React, { useMemo } from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";

const findOption = (opts, id) =>
  opts.find((o) => String(o.value) === String(id)) || null;

const safeArray = (v) => (Array.isArray(v) ? v : []);

const RepairTabDeviceInfo = ({ form, lookups }) => {
  const { formData, setField, errorMessage } = form;

  const {
    deviceTypes = [],
    brands = [],
    deviceModels = [],
    accessories = [],
    storageLocations = [],
    deviceColors = [],
  } = lookups?.data || {};

  // ✅ options
  const deviceTypesOption = useMemo(
    () =>
      (deviceTypes || []).map((d) => ({
        value: d.device_type_id,
        label: d.device_type_name,
      })),
    [deviceTypes]
  );

  const brandsOption = useMemo(
    () =>
      (brands || []).map((b) => ({
        value: b.brand_id,
        label: b.brand_name,
      })),
    [brands]
  );

  const deviceModelsOption = useMemo(
    () =>
      (deviceModels || []).map((m) => ({
        value: m.device_model_id,
        label: m.device_model_name,
      })),
    [deviceModels]
  );

  const accessoriesOption = useMemo(
    () =>
      (accessories || []).map((a) => ({
        value: a.accessories_id,
        label: a.accessories_name,
      })),
    [accessories]
  );

  const storageLocationsOption = useMemo(
    () =>
      (storageLocations || []).map((s) => ({
        value: s.storage_location_id,
        label: s.storage_location_name,
      })),
    [storageLocations]
  );

  const deviceColorsOption = useMemo(
    () =>
      (deviceColors || []).map((c) => ({
        value: c.device_color_id,
        label: c.device_color_name,
      })),
    [deviceColors]
  );

  // ✅ Accessories value (recommended: store array in state)
  // formData.repair_device_accessories_id should be array like: [1,2,3]
  const selectedAccessories = useMemo(() => {
    const ids = safeArray(formData.repair_device_accessories_id);
    const set = new Set(ids.map(String));
    return accessoriesOption.filter((o) => set.has(String(o.value)));
  }, [formData.repair_device_accessories_id, accessoriesOption]);

  return (
    <Row>
      {/* Device Type */}
      <Col md={4}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>
            Device Type <span className="text-danger">*</span>
          </Label>
          <span
            role="button"
            onClick={() => lookups.ui.setIsDeviceTypeOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        <Select
          value={findOption(deviceTypesOption, formData.repair_device_type_id)}
          options={deviceTypesOption}
          placeholder="Select Device Type"
          onChange={(opt) => setField("repair_device_type_id", opt?.value || 0)}
        />

        {errorMessage?.repair_device_type_id && (
          <span className="text-danger small">
            {errorMessage.repair_device_type_id}
          </span>
        )}
      </Col>

      {/* Device Brand */}
      <Col md={4}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>
            Device Brand <span className="text-danger">*</span>
          </Label>
          <span
            role="button"
            onClick={() => lookups.ui.setIsBrandOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        <Select
          value={findOption(brandsOption, formData.repair_device_brand_id)}
          options={brandsOption}
          placeholder="Select Brand"
          onChange={(opt) => {
            setField("repair_device_brand_id", opt?.value || 0);
            // Optional: reset model when brand changes
            setField("repair_device_model_id", 0);
          }}
        />

        {errorMessage?.repair_device_brand_id && (
          <span className="text-danger small">
            {errorMessage.repair_device_brand_id}
          </span>
        )}
      </Col>

      {/* Device Model */}
      <Col md={4}>
        <div className="d-flex justify-content-between align-items-center">
          <Label>Device Model</Label>
          <span
            role="button"
            onClick={() => lookups.ui.setIsDeviceModelOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        <Select
          value={findOption(deviceModelsOption, formData.repair_device_model_id)}
          options={deviceModelsOption}
          placeholder="Select Device Model"
          onChange={(opt) => setField("repair_device_model_id", opt?.value || 0)}
        />
      </Col>

      {/* Serial / IMEI Number */}
      <Col md={4} className="mt-3">
        <Label>Serial / IMEI Number</Label>
        <Input
          value={formData.repair_device_serial_number || ""}
          onChange={(e) => setField("repair_device_serial_number", e.target.value)}
          className="form-control"
          placeholder="Enter Serial / IMEI Number"
        />
      </Col>

      {/* Accessories */}
      <Col md={4} className="mt-3">
        <Label>Accessories</Label>
        <Select
          isMulti
          options={accessoriesOption}
          placeholder="Select Accessories"
          value={selectedAccessories}
          onChange={(selected) => {
            const ids = (selected || []).map((o) => o.value);
            setField("repair_device_accessories_id", ids); // ✅ store as array
          }}
        />
      </Col>

      {/* Storage Location */}
      <Col md={4} className="mt-3">
        <Label>Storage Location</Label>
        <Select
          value={findOption(
            storageLocationsOption,
            formData.repair_device_storage_location_id
          )}
          options={storageLocationsOption}
          placeholder="Select Storage Location"
          onChange={(opt) =>
            setField("repair_device_storage_location_id", opt?.value || 0)
          }
        />
      </Col>

      {/* Device Color */}
      <Col md={4} className="mt-1">
        <div className="d-flex justify-content-between align-items-center">
          <Label>Device Color</Label>
          <span
            role="button"
            onClick={() => lookups.ui.setIsDeviceColorOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>

        <Select
          value={findOption(deviceColorsOption, formData.repair_device_color_id)}
          options={deviceColorsOption}
          placeholder="Select Device Color"
          onChange={(opt) => setField("repair_device_color_id", opt?.value || 0)}
        />
      </Col>

      {/* Device Password */}
      <Col md={4} className="mt-3">
        <Label>Device Password</Label>
        <Input
          value={formData.repair_device_password || ""}
          onChange={(e) => setField("repair_device_password", e.target.value)}
          className="form-control"
          placeholder="Enter Device Password"
        />
      </Col>
    </Row>
  );
};

export default RepairTabDeviceInfo;
