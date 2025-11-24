import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { getDeviceTypesList } from "../../../store/DeviceType";
import { getBrandsList } from "../../../store/Brand";
import { getAccessoriesList } from "../../../store/Accessories";
import { getStorageLocationsList } from "../../../store/StorageLocation";
import { getDeviceColorList } from "../../../store/DeviceColor";
import { useEffect } from "react";
import DeviceColorAdd from "../../DeviceColor/DeviceColorAdd";
import DeviceModelAdd from "../../DeviceModel/DeviceModelAdd";
import BrandAdd from "../../Brand/BrandAdd";
import DeviceTypeAdd from "../../DeviceType/DeviceTypeAdd";

const RepairTabDeviceInfo = ({ formData, handleInputChange, errorMessage }) => {
  const dispatch = useDispatch();
  const [isDeviceTypeModalOpen, setIsDeviceTypeModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isDeviceModelModalOpen, setIsDeviceModelModalOpen] = useState(false);
  const [isDeviceColorModalOpen, setIsDeviceColorModalOpen] = useState(false);
  useEffect(() => {
    [
      getDeviceColorList,
      getStorageLocationsList,
      getAccessoriesList,

      getDeviceTypesList,

      getBrandsList,
    ].forEach((action) => dispatch(action()));
  }, [dispatch]);
  const deviceTypes = useSelector(
    (state) => state.DeviceTypeReducer?.deviceTypes
  );
  const brands = useSelector((state) => state.BrandReducer?.brands);
  const deviceModels = useSelector(
    (state) => state.DeviceModelReducer?.deviceModels
  );
  const accessories = useSelector(
    (state) => state.AccessoriesReducer?.accessories
  );
  const storageLocations = useSelector(
    (state) => state.StorageLocationReducer?.storageLocations
  );
  const deviceColors = useSelector(
    (state) => state.DeviceColorReducer?.deviceColors || []
  );
  const mapOptions = (list, valueKey, labelKey) =>
    list.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));
  const deviceTypesOption = mapOptions(
    deviceTypes,
    "device_type_id",
    "device_type_name"
  );
  const brandsOption = mapOptions(brands, "brand_id", "brand_name");
  const deviceModelsOption = mapOptions(
    deviceModels,
    "device_model_id",
    "device_model_name"
  );
  const accessoriesOption = mapOptions(
    accessories,
    "accessories_id",
    "accessories_name"
  );
  const storageLocationsOption = mapOptions(
    storageLocations,
    "storage_location_id",
    "storage_location_name"
  );
  const deviceColorsOption = mapOptions(
    deviceColors,
    "device_color_id",
    "device_color_name"
  );
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
            (opt) => opt.value === formData.repair_device_storage_location_id
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
      {isDeviceTypeModalOpen && (
        <DeviceTypeAdd
          isOpen={isDeviceTypeModalOpen}
          toggle={() => setIsDeviceTypeModalOpen(false)}
        />
      )}
      {isBrandModalOpen && (
        <BrandAdd
          isOpen={isBrandModalOpen}
          toggle={() => setIsBrandModalOpen(false)}
        />
      )}
      {isDeviceModelModalOpen && (
        <DeviceModelAdd
          isOpen={isDeviceModelModalOpen}
          toggle={() => setIsDeviceModelModalOpen(false)}
        />
      )}
      {isDeviceColorModalOpen && (
        <DeviceColorAdd
          isOpen={isDeviceColorModalOpen}
          toggle={() => setIsDeviceColorModalOpen(false)}
        />
      )}
    </Row>
  );
};

export default RepairTabDeviceInfo;
