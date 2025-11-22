import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";

const RepairTabDeviceInfo = ({
  formData,
  handleInputChange,
  errorMessage,
  deviceTypesOption,
  brandsOption,
  deviceModelsOption,
  accessoriesOption,
  storageLocationsOption,
  deviceColorsOption,
  setIsDeviceTypeModalOpen,
  setIsBrandModalOpen,
  setIsDeviceModelModalOpen,
  setIsDeviceColorModalOpen,
}) => {
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
            onClick={() => setIsDeviceTypeModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={deviceTypesOption.find(
            (opt) => opt.value === formData.repair_device_type_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_type_id", opt.value)
          }
          options={deviceTypesOption}
          placeholder="Select Device Type"
        />
        {errorMessage.repair_device_type_id && (
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
            onClick={() => setIsBrandModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={brandsOption.find(
            (opt) => opt.value === formData.repair_device_brand_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_brand_id", opt.value)
          }
          options={brandsOption}
          placeholder="Select Brand"
        />
        {errorMessage.repair_device_brand_id && (
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
            onClick={() => setIsDeviceModelModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={deviceModelsOption.find(
            (opt) => opt.value === formData.repair_device_model_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_model_id", opt.value)
          }
          options={deviceModelsOption}
          placeholder="Select Device Model"
        />
      </Col>

      {/* Serial / IMEI Number */}
      <Col md={4} className="mt-3">
        <Label>Serial / IMEI Number</Label>
        <Input
          value={formData.repair_device_serial_number}
          onChange={(e) =>
            handleInputChange("repair_device_serial_number", e.target.value)
          }
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
          value={
            formData.repair_device_accessories_id
              ? accessoriesOption.filter((opt) =>
                  JSON.parse(formData.repair_device_accessories_id).includes(
                    opt.value
                  )
                )
              : []
          }
          onChange={(selectedOptions) => {
            const selectedIds = selectedOptions.map((opt) => opt.value);
            handleInputChange(
              "repair_device_accessories_id",
              JSON.stringify(selectedIds)
            );
          }}
        />
      </Col>

      {/* Storage Location */}
      <Col md={4} className="mt-3">
        <Label>Storage Location</Label>
        <Select
          value={storageLocationsOption.find(
            (opt) =>
              opt.value === formData.repair_device_storage_location_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_storage_location_id", opt.value)
          }
          options={storageLocationsOption}
          placeholder="Select Storage Location"
        />
      </Col>

      {/* Device Color */}
      <Col md={4} className="mt-1">
        <div className="d-flex justify-content-between align-items-center">
          <Label>Device Color</Label>
          <span
            role="button"
            onClick={() => setIsDeviceColorModalOpen(true)}
            className="text-success fw-bold me-2"
            style={{ fontSize: "25px", cursor: "pointer", userSelect: "none" }}
          >
            +
          </span>
        </div>
        <Select
          value={deviceColorsOption.find(
            (opt) => opt.value === formData.repair_device_color_id
          )}
          onChange={(opt) =>
            handleInputChange("repair_device_color_id", opt.value)
          }
          options={deviceColorsOption}
          placeholder="Select Device Color"
        />
      </Col>

      {/* Device Password */}
      <Col md={4} className="mt-3">
        <Label>Device Password</Label>
        <Input
          value={formData.repair_device_password}
          onChange={(e) =>
            handleInputChange("repair_device_password", e.target.value)
          }
          className="form-control"
          placeholder="Enter Device Password"
        />
      </Col>
    </Row>
  );
};

export default RepairTabDeviceInfo;
