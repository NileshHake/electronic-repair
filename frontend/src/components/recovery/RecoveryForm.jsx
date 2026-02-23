// components/RecoveryForm.js
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useStoreRecoveryMutation } from "@/redux/features/recoveryApi";

const RecoveryForm = () => {
  const [storeRecovery, { isLoading }] = useStoreRecoveryMutation();

  const [formData, setFormData] = useState({
    recovery_problem_description: "",
    recovery_received_date: new Date() ,
    recovery_workflow_id: 1,
    recovery_workflow_stage_id: 1,
    recovery_created_by: "2",
    recovery_image: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [vendors, setVendors] = useState([]);

  // ✅ Fetch nearby vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("/api/vendors/nearby");
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setVendors([]);
      }
    };
    fetchVendors();
  }, []);

  // ✅ React-Select Options
  const vendorOptions = useMemo(() => {
    return vendors.map((v) => ({
      label: v?.name ?? v?.vendor_name ?? `Vendor #${v?.id}`,
      value: v?.id,
    }));
  }, [vendors]);

  // ✅ Selected Option (for react-select controlled)
  const selectedVendor = useMemo(() => {
    return vendorOptions.find((o) => String(o.value) === String(formData.recovery_created_by)) || null;
  }, [vendorOptions, formData.recovery_created_by]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 40,
      borderRadius: 8,
      borderColor: state.isFocused ? "#86b7fe" : base.borderColor,
      boxShadow: "none",
    }),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Multiple Images
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    setFormData((prev) => ({
      ...prev,
      recovery_image: [...prev.recovery_image, ...files],
    }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      recovery_image: prev.recovery_image.filter((_, i) => i !== index),
    }));

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.recovery_problem_description || !formData.recovery_created_by) {
      alert("Please fill required fields!");
      return;
    }

    try {
      const fd = new FormData();

      fd.append("recovery_problem_description", formData.recovery_problem_description);
      fd.append("recovery_received_date", formData.recovery_received_date);
      fd.append("recovery_workflow_id", formData.recovery_workflow_id);
      fd.append("recovery_workflow_stage_id", formData.recovery_workflow_stage_id);
      fd.append("recovery_created_by", formData.recovery_created_by);

      formData.recovery_image.forEach((file) => {
        fd.append("recovery_image[]", file);
      });

      await storeRecovery(fd).unwrap();

      // ✅ Reset form
      setFormData({
        recovery_problem_description: "",
        recovery_received_date: new Date().toISOString().split("T")[0],
        recovery_workflow_id: 1,
        recovery_workflow_stage_id: 1,
        recovery_created_by: "",
        recovery_image: [],
      });

      setPreviewImages([]);
    } catch (err) {
      console.error("Store failed:", err);
      alert("Failed to store recovery!");
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <h5 className="fw-bold mb-3 text-center">Add Recovery</h5>

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {/* Description */}
        <div>
          <label className="form-label fw-bold">
            Problem Description <span className="text-danger">*</span>
          </label>
          <textarea
            name="recovery_problem_description"
            value={formData.recovery_problem_description}
            onChange={handleChange}
            className="form-control"
            rows={3}
          />
        </div>

        {/* ✅ Vendor Select (React Select) */}
        <div>
          <label className="form-label fw-bold">
            Select Nearby Vendor <span className="text-danger">*</span>
          </label>
          <Select
            options={vendorOptions}
            value={selectedVendor}
            onChange={(opt) =>
              setFormData((prev) => ({
                ...prev,
                recovery_created_by: opt?.value ? String(opt.value) : "",
              }))
            }
            placeholder="Select Vendor"
            isClearable
            styles={selectStyles}
          />
        </div>

        {/* Images */}
        <div>
          <label className="form-label fw-bold">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="form-control"
          />

          <div className="d-flex flex-wrap gap-2 mt-2">
            {previewImages.map((src, index) => (
              <div key={index} className="position-relative">
                <img
                  src={src}
                  alt="preview"
                  className="img-thumbnail"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  style={{ padding: "0 5px" }}
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Recovery"}
        </button>
      </form>
    </div>
  );
};

export default RecoveryForm;