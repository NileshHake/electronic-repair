// components/RepairForm.js
import React, { useState, useEffect } from "react";
import { useGetallBrandsQuery } from "@/redux/features/brandApi";
import { useGetallDeviceTypeQuery } from "@/redux/features/devicetypeApi";
import { useStoreRepairMutation } from "@/redux/features/repairApi"; // ✅ your store endpoint hook

const RepairForm = () => {
  const { data: brands = [] } = useGetallBrandsQuery();
  const { data: deviceTypes = [] } = useGetallDeviceTypeQuery();

  const [storeRepair, { isLoading }] = useStoreRepairMutation();

  const [formData, setFormData] = useState({
    repair_device_type_id: "",
    repair_device_brand_id: "",
    repair_device_password: "",
    repair_problem_description: "",
    repair_images: [], // multiple images
    repair_video: null, // one video
    repair_created_by: "", // vendor id
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch("/api/vendors/nearby");
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
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
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      repair_images: [...prev.repair_images, ...files],
    }));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      repair_images: prev.repair_images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ one video
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, repair_video: file }));
    setPreviewVideo(file ? URL.createObjectURL(file) : null);
  };

  // ✅ SUBMIT + call store API with FormData append
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

      // ✅ normal fields
      fd.append("repair_device_type_id", formData.repair_device_type_id);
      fd.append("repair_device_brand_id", formData.repair_device_brand_id);
      fd.append("repair_device_password", formData.repair_device_password || "");
      fd.append("repair_problem_description", formData.repair_problem_description);
      fd.append("repair_created_by", formData.repair_created_by);

      // ✅ multiple images (send as repair_images[])
      formData.repair_images.forEach((file) => {
        fd.append("repair_images[]", file);
      });

      // ✅ single video
      if (formData.repair_video) {
        fd.append("repair_video", formData.repair_video);
      }

      // ✅ API call
      const res = await storeRepair(fd).unwrap();
      console.log("✅ STORE SUCCESS:", res);

      // ✅ reset after success
      setFormData({
        repair_device_type_id: "",
        repair_device_brand_id: "",
        repair_device_password: "",
        repair_problem_description: "",
        repair_images: [],
        repair_video: null,
        repair_created_by: "",
      });
      setPreviewImages([]);
      setPreviewVideo(null);
    } catch (err) {
      console.error("❌ STORE ERROR:", err);
      // toast already handled in endpoint if you added it there
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
        </form>
      </div>
    </div>
  );
};

export default RepairForm;
