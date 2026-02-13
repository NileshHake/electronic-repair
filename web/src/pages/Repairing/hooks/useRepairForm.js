/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Repairing/hooks/useRepairForm.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addRepair, updateRepair } from "../../../store/Repairing";
import { api } from "../../../config";
import AuthUser from "../../../helpers/AuthType/AuthUser";

export const useRepairForm = ({ toggle, mode = "add", initialData = null }) => {
  const dispatch = useDispatch();
  const { user } = AuthUser();

  const [activeTab, setActiveTab] = useState("1");
  const [errorMessage, setErrorMessage] = useState({});

  const [formData, setFormData] = useState({
    repair_id: "",
    repair_customer_id: "",
    repair_problem_description: "",
    repair_estimated_cost: "",
    repair_received_date: new Date(),
    repair_expected_delivery_date: null,
    repair_assigned_technician_to: "",
    repair_delivery_and_pickup_to: "",
    repair_device_serial_number: "",
    repair_device_accessories_id: [], // ✅ array
    repair_device_services_id: [{ service: "", cost: "" }], // ✅ array of objects
    repair_device_priority: "",
    repair_device_password: "",
    repair_workflow_id: 0,
    repair_workflow_stage_id: 0,
    repair_source_id: 0,
    repair_referred_by_id: 0,
    repair_service_type_id: 0,
    repair_type_id: 0,
    repair_device_type_id: 0,
    repair_device_brand_id: 0,
    repair_device_model_id: 0,
    repair_device_storage_location_id: 0,
    repair_device_hardware_configuration_id: 0,
    repair_device_color_id: 0,
  });

  const [galleryFiles, setGalleryFiles] = useState([]); // existing + new Files

  const setField = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setErrorMessage((p) => ({ ...p, [key]: "" }));
  };

  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  // ✅ FIX nested weird update payloads
  const normalizeServicesArray = (input) => {
    let v = input;

    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        v = [];
      }
    }

    // unwrap [[[[...]]]]
    while (Array.isArray(v) && v.length === 1) v = v[0];

    // unwrap {"0": ...}
    while (isObj(v) && Object.keys(v).length === 1 && "0" in v) v = v["0"];

    if (isObj(v)) v = [v];
    if (!Array.isArray(v)) v = [];

    const cleaned = v
      .map((item) => {
        let x = item;

        while (isObj(x) && Object.keys(x).length === 1 && "0" in x) x = x["0"];
        if (!isObj(x)) return null;

        return {
          service: String(x.service ?? ""),
          cost: String(x.cost ?? ""),
        };
      })
      .filter((x) => x && (x.service.trim() || x.cost.trim()));

    return cleaned.length ? cleaned : [{ service: "", cost: "" }];
  };

  const normalizeAccessoriesArray = (input) => {
    let v = input;

    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        v = String(v || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
    }

    if (Array.isArray(v)) {
      return v
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);
    }

    if (v === null || v === undefined) return [];
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? [n] : [];
  };

  const setInitialData = (data) => {
    if (!data) return;

    const servicesArr = normalizeServicesArray(data.repair_device_services_id);
    const accessoriesArr = normalizeAccessoriesArray(data.repair_device_accessories_id);

    setFormData((p) => ({
      ...p,
      ...data,
      // ✅ force correct types (important for selects)
      repair_workflow_id: Number(data.repair_workflow_id || 0),
      repair_workflow_stage_id: Number(data.repair_workflow_stage_id || 0),
      repair_device_type_id: Number(data.repair_device_type_id || 0),
      repair_device_brand_id: Number(data.repair_device_brand_id || 0),
      repair_device_model_id: Number(data.repair_device_model_id || 0),
      repair_device_color_id: Number(data.repair_device_color_id || 0),

      repair_device_services_id: servicesArr,
      repair_device_accessories_id: accessoriesArr,
    }));

    // ✅ existing images -> galleryFiles
    try {
      const imgs = JSON.parse(data.repair_image || "[]");
      const mapped = (imgs || []).map((imgName) => ({
        name: imgName,
        preview: `${api.IMG_URL}repair_images/${imgName}`,
        formattedSize: "Existing Image",
        isExisting: true,
      }));
      setGalleryFiles(mapped);
    } catch {
      setGalleryFiles([]);
    }
  };

  // ✅ IMPORTANT: update modal open/close -> initialData changes
  useEffect(() => {
    if (mode === "update" && initialData) setInitialData(initialData);
  }, [mode, initialData]);

  const validate = () => {
    const f = formData;
    const errors = {};

    if (user?.user_type !== 6 && !f.repair_customer_id)
      errors.repair_customer_id = "Please select a customer.";
    else if (!f.repair_service_type_id)
      errors.repair_service_type_id = "Please select a service type.";
    else if (!f.repair_type_id) errors.repair_type_id = "Please select a repair type.";
    else if (!f.repair_device_type_id)
      errors.repair_device_type_id = "Please select a device type.";
    else if (!f.repair_device_brand_id)
      errors.repair_device_brand_id = "Please select a device brand.";

    const servicesArr = normalizeServicesArray(f.repair_device_services_id);
    const okServices = servicesArr.some((x) => x.service.trim() || x.cost.trim());
    if (!okServices) errors.repair_device_services_id = "Please add at least one service.";

    if (!String(f.repair_device_priority || "").trim())
      errors.repair_device_priority = "Please select a device priority.";

    setErrorMessage(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();

    Object.entries(formData).forEach(([k, v]) => {
      if (k === "repair_device_services_id") return;
      if (k === "repair_device_accessories_id") return;
      fd.append(k, v ?? "");
    });

    // ✅ store as JSON (one time)
    fd.append(
      "repair_device_accessories_id",
      JSON.stringify(normalizeAccessoriesArray(formData.repair_device_accessories_id))
    );

    fd.append(
      "repair_device_services_id",
      JSON.stringify(normalizeServicesArray(formData.repair_device_services_id))
    );

    // ✅ images: old + new
    for (const item of galleryFiles) {
      if (item?.isExisting) fd.append("old_images[]", item.name);
      else fd.append("repair_images[]", item); // item is File
    }

    if (mode === "update") dispatch(updateRepair(fd));
    else dispatch(addRepair(fd));
  };

  return {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    setField,
    errorMessage,
    setErrorMessage,
    galleryFiles,
    setGalleryFiles,
    normalizeServicesArray,
    normalizeAccessoriesArray,
    onSubmit,
    setInitialData,
  };
};
