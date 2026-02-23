// components/RepairForm.js
import React, { useEffect, useRef, useState } from "react";
import { useGetallBrandsQuery } from "@/redux/features/brandApi";
import { useGetallDeviceTypeQuery } from "@/redux/features/devicetypeApi";
import { useStoreRepairMutation } from "@/redux/features/repairApi";

const RepairForm = () => {
  const { data: brands = [] } = useGetallBrandsQuery();
  const { data: deviceTypes = [] } = useGetallDeviceTypeQuery();

  const [storeRepair, { isLoading }] = useStoreRepairMutation();

  const getToday = () => new Date().toISOString().split("T")[0];

  const initialForm = {
    repair_device_type_id: "",
    repair_device_brand_id: "",
    repair_device_password: "",
    repair_problem_description: "",
    repair_workflow_id: 1,
    repair_workflow_stage_id: 1,
    repair_received_date: getToday(),
    repair_image: [], 
    repair_video: null,
    repair_created_by: "1", 
  };

  const [formData, setFormData] = useState(initialForm);

  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [vendors, setVendors] = useState([]);

  // ✅ refs to clear file inputs
  const imagesInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch("/api/vendors/nearby");
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setVendors([]);
      }
    }
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ multiple images
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      repair_image: [...prev.repair_image, ...files],
    }));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);

    // ✅ allow selecting same file again
    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      repair_image: prev.repair_image.filter((_, i) => i !== index),
    }));

    setPreviewImages((prev) => {
      // ✅ revoke object url
      const toRemove = prev[index];
      if (toRemove) URL.revokeObjectURL(toRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ✅ one video
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0] || null;

    // ✅ revoke old preview
    setPreviewVideo((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });

    setFormData((prev) => ({ ...prev, repair_video: file }));
    setPreviewVideo(file ? URL.createObjectURL(file) : null);

    // ✅ allow selecting same video again
    e.target.value = "";
  };

  const resetAll = () => {
    // ✅ revoke all image previews
    previewImages.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {}
    });

    // ✅ revoke video preview
    if (previewVideo) {
      try {
        URL.revokeObjectURL(previewVideo);
      } catch {}
    }

    // ✅ reset state
    setFormData({ ...initialForm, repair_received_date: getToday() });
    setPreviewImages([]);
    setPreviewVideo(null);

    // ✅ clear file inputs
    if (imagesInputRef.current) imagesInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.repair_device_type_id ||
      !formData.repair_device_brand_id ||
      !formData.repair_problem_description ||
      !formData.repair_created_by
    ) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const fd = new FormData();

      fd.append("repair_device_type_id", formData.repair_device_type_id);
      fd.append("repair_device_brand_id", formData.repair_device_brand_id);
      fd.append("repair_device_password", formData.repair_device_password || "");
      fd.append("repair_problem_description", formData.repair_problem_description);
      fd.append("repair_created_by", formData.repair_created_by);
      fd.append("repair_received_date", formData.repair_received_date);
      fd.append("repair_workflow_id", formData.repair_workflow_id);
      fd.append("repair_workflow_stage_id", formData.repair_workflow_stage_id);

      // ✅ multiple images (repair_image[])
      formData.repair_image.forEach((file) => {
        fd.append("repair_image[]", file);
      });

      // ✅ single video
      if (formData.repair_video) {
        fd.append("repair_video", formData.repair_video);
      }

      const res = await storeRepair(fd).unwrap();
      console.log("✅ STORE SUCCESS:", res);

      // ✅ clear all fields after success
      resetAll();
    } catch (err) {
      console.error("❌ STORE ERROR:", err);
      alert("Failed to store repair!");
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <h4 className="mb-3 text-center">Add Repair Order</h4>

      <div
        style={{
          maxHeight: "500px",
          overflowY: "scroll",
          paddingRight: "5px",
          scrollbarWidth: "none",
        }}
        className="scrollbar-hidden"
      >
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 ps-2">
          {/* Device Type */}
          <div>
            <label className="form-label fw-bold">
              Device Type <span className="text-danger">*</span>
            </label>
            <select
              name="repair_device_type_id"
              value={formData.repair_device_type_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Device Type</option>
              {deviceTypes.map((dt) => (
                <option key={dt.device_type_id} value={dt.device_type_id}>
                  {dt.device_type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Device Brand */}
          <div>
            <label className="form-label fw-bold">
              Device Brand <span className="text-danger">*</span>
            </label>
            <select
              name="repair_device_brand_id"
              value={formData.repair_device_brand_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Brand</option>
              {brands.map((db) => (
                <option key={db.brand_id} value={db.brand_id}>
                  {db.brand_name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="form-label fw-bold">
              Assign to Vendor <span className="text-danger">*</span>
            </label>
            <select
              name="repair_created_by"
              value={formData.repair_created_by}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Device Password */}
          <div>
            <label className="form-label fw-bold">Device Password</label>
            <input
              type="text"
              name="repair_device_password"
              value={formData.repair_device_password}
              onChange={handleChange}
              placeholder="Enter device password (if any)"
              className="form-control"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="form-label fw-bold">
              Problem Description <span className="text-danger">*</span>
            </label>
            <textarea
              name="repair_problem_description"
              value={formData.repair_problem_description}
              onChange={handleChange}
              placeholder="Describe the problem in detail"
              rows={3}
              className="form-control"
            />
          </div>

          {/* Images */}
          <div>
            <label className="form-label fw-bold">Upload Images</label>
            <input
              ref={imagesInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="form-control"
            />

            <div className="d-flex flex-wrap gap-2 mt-2">
              {previewImages.map((src, idx) => (
                <div key={idx} className="position-relative">
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className="img-thumbnail"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    style={{ padding: "0 5px" }}
                    onClick={() => removeImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Video */}
          <div>
            <label className="form-label fw-bold">Upload Video</label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="form-control"
            />

            {previewVideo && (
              <video
                src={previewVideo}
                controls
                className="mt-2"
                style={{ width: "100%", maxHeight: "300px" }}
              />
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
            {isLoading ? "Saving..." : "Add Repair Order"}
          </button>

          {/* Optional: manual reset */}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={resetAll}
            disabled={isLoading}
          >
            Clear
          </button>
        </form>
      </div>
    </div>
  );
};

export default RepairForm;