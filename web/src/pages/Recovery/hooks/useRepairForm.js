/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/hooks/useRecoveryForm.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addRecovery, updateRecovery } from "../../../store/recovery/index";
import { api } from "../../../config";
import AuthUser from "../../../helpers/AuthType/AuthUser";

export const useRecoveryForm = ({ toggle, mode = "add", initialData = null }) => {
  const dispatch = useDispatch();
  const { user } = AuthUser();

  const [activeTab, setActiveTab] = useState("1");
  const [errorMessage, setErrorMessage] = useState({});

  const [formData, setFormData] = useState({
    recovery_id: "",
    recovery_customer_id: "",
    recovery_problem_description: "",
    recovery_received_date: new Date(),        // ✅ NEW
    recovery_workflow_id: 0,                   // ✅ NEW
    recovery_workflow_stage_id: 0,             // ✅ NEW
    recovery_image: [],
  });

  const [galleryFiles, setGalleryFiles] = useState([]);

  const setField = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setErrorMessage((p) => ({ ...p, [key]: "" }));
  };

  const setInitialData = (data) => {
    if (!data) return;

    setFormData((p) => ({
      ...p,
      ...data,
      recovery_id: data.recovery_id ?? "",
      recovery_customer_id: data.recovery_customer_id ?? "",
      recovery_problem_description: data.recovery_problem_description ?? "",
      recovery_received_date: data.recovery_received_date
        ? new Date(data.recovery_received_date)
        : new Date(),
      recovery_workflow_id: Number(data.recovery_workflow_id || 0),
      recovery_workflow_stage_id: Number(data.recovery_workflow_stage_id || 0),
    }));

    // ✅ existing images
    try {
      const imgs = JSON.parse(data.recovery_image || "[]");
      const mapped = (imgs || []).map((imgName) => ({
        name: imgName,
        preview: `${api.IMG_URL}recovery_images/${imgName}`,
        formattedSize: "Existing Image",
        isExisting: true,
      }));
      setGalleryFiles(mapped);
    } catch {
      setGalleryFiles([]);
    }
  };

  useEffect(() => {
    if (mode === "update" && initialData) setInitialData(initialData);
  }, [mode, initialData]);

  const validate = () => {
    const f = formData;
    const errors = {};

    if (user?.user_type !== 6 && !f.recovery_customer_id) {
      errors.recovery_customer_id = "Please select a customer.";
    }

    if (!String(f.recovery_problem_description || "").trim()) {
      errors.recovery_problem_description = "Please enter problem description.";
    }
 

    setErrorMessage(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();

    fd.append("recovery_id", formData.recovery_id ?? "");
    fd.append("recovery_customer_id", formData.recovery_customer_id ?? "");
    fd.append("recovery_problem_description", formData.recovery_problem_description ?? "");
    fd.append("recovery_received_date", formData.recovery_received_date ?? "");
    fd.append("recovery_workflow_id", formData.recovery_workflow_id ?? 0);
    fd.append("recovery_workflow_stage_id", formData.recovery_workflow_stage_id ?? 0);

    // images (optional)
    for (const item of galleryFiles) {
      if (!item) continue;
      if (item?.isExisting) fd.append("old_images[]", item.name);
      else fd.append("recovery_image[]", item);
    }

    if (mode === "update") dispatch(updateRecovery(fd));
    else dispatch(addRecovery(fd));
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
    onSubmit,
    setInitialData,
  };
};