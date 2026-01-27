"use client";

import React, { useEffect, useState } from "react";
import { useCreateBeadingRequestMutation } from "@/redux/features/beadingApi";
import { toast } from "react-toastify";

const BeadingForm = () => {
  const [createBeadingRequest, { isLoading }] = useCreateBeadingRequestMutation();

  const [formData, setFormData] = useState({
    beading_request_title: "",
    beading_request_description: "",
    beading_budget_min: "",
    beading_budget_max: "",
    beading_location: "",
    beading_request_images: [],
    
  });

  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    return () => {
      previewImages.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormData((p) => ({
      ...p,
      beading_request_images: [...p.beading_request_images, ...files],
    }));

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages((p) => [...p, ...newPreviews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((p) => ({
      ...p,
      beading_request_images: p.beading_request_images.filter((_, i) => i !== index),
    }));

    setPreviewImages((p) => {
      const url = p[index];
      if (url) URL.revokeObjectURL(url);
      return p.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validations
    if (!formData.beading_request_title.trim()) return alert("Request title is required");
    if (!formData.beading_request_description.trim()) return alert("Request description is required");
    if (!formData.beading_budget_min) return alert("Budget min is required");
    if (!formData.beading_budget_max) return alert("Budget max is required");
    if (!formData.beading_location.trim()) return alert("Location is required");
    
    const min = Number(formData.beading_budget_min);
    const max = Number(formData.beading_budget_max);
    if (Number.isNaN(min) || Number.isNaN(max)) return alert("Budget must be number");
    if (min > max) return alert("Budget min should be less than or equal to Budget max");

    // ✅ FormData build (multipart)
    const fd = new FormData();
    fd.append("beading_request_title", formData.beading_request_title);
    fd.append("beading_request_description", formData.beading_request_description);
    fd.append("beading_budget_min", formData.beading_budget_min);
    fd.append("beading_budget_max", formData.beading_budget_max);
    fd.append("beading_location", formData.beading_location);
     
    // ✅ key must match backend: req.files.beading_images
    formData.beading_request_images.forEach((file) => {
      fd.append("beading_images", file);
    });

    try {
      const res = await createBeadingRequest(fd).unwrap();
      toast.success(res?.message || "✅ Beading request created");

      // ✅ reset after success
      previewImages.forEach((u) => URL.revokeObjectURL(u));
      setPreviewImages([]);

      setFormData({
        beading_request_title: "",
        beading_request_description: "",
        beading_budget_min: "",
        beading_budget_max: "",
        beading_location: "",
        beading_request_images: [],
     
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "❌ Failed to create beading request");
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <h4 className="mb-3 text-center">Add Beading Request</h4>

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
          {/* Title */}
          <div>
            <label className="form-label fw-bold">
              Request Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="beading_request_title"
              value={formData.beading_request_title}
              onChange={handleChange}
              placeholder="Enter request title"
              className="form-control"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label fw-bold">
              Request Description <span className="text-danger">*</span>
            </label>
            <textarea
              name="beading_request_description"
              value={formData.beading_request_description}
              onChange={handleChange}
              placeholder="Describe beading work details"
              rows={3}
              className="form-control"
            />
          </div>

          {/* Budget */}
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label fw-bold">
                Budget Min <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="beading_budget_min"
                value={formData.beading_budget_min}
                onChange={handleChange}
                placeholder="Min"
                className="form-control"
              />
            </div>
            <div className="col-6">
              <label className="form-label fw-bold">
                Budget Max <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="beading_budget_max"
                value={formData.beading_budget_max}
                onChange={handleChange}
                placeholder="Max"
                className="form-control"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="form-label fw-bold">
              Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="beading_location"
              value={formData.beading_location}
              onChange={handleChange}
              placeholder="Enter location"
              className="form-control"
            />
          </div>

           
          

          {/* Images */}
          <div>
            <label className="form-label fw-bold">Upload Images (Multiple)</label>
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

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="btn btn-primary mt-2">
            {isLoading ? "Saving..." : "Add Beading Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BeadingForm;
