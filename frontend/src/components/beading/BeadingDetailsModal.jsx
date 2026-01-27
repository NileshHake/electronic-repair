"use client";

import React, { useEffect, useMemo } from "react";

/* ================= HELPERS ================= */
const statusText = (s) => {
  const n = Number(s);
  if (n === 0) return "Pending";
  if (n === 1) return "Accepted";
  return "Unknown";
};

const statusBadgeClass = (s) => {
  const n = Number(s);
  if (n === 0) return "bg-warning text-dark";
  if (n === 1) return "bg-success";
  return "bg-secondary";
};

const parseImgs = (imagesString) => {
  if (!imagesString) return [];
  return String(imagesString)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const isAccepted = (s) => Number(s) === 1;

/* ================= COMPONENT ================= */
const BeadingDetailsModal = ({ open, onClose, data, imgBaseUrl }) => {
  const baseURL = useMemo(() => {
    const u = imgBaseUrl || "";
    return u.endsWith("/") ? u : u + "/";
  }, [imgBaseUrl]);

  /* ESC close + body lock */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open || !data) return null;

  const imgs = parseImgs(data?.beading_request_images);

  const copy = (val) => val && navigator.clipboard?.writeText(String(val));

  return (
    <>
      {/* BACKDROP */}
      <div className="bdm-backdrop" onClick={onClose} />

      {/* MODAL */}
      <div className="bdm-wrap" onClick={onClose}>
        <div className="bdm-card" onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className="bdm-header">
            <div>
              <h5 className="mb-1 text-white fw-bold">
                Beading Request Details
              </h5>
              <div className="small text-white-50">
                Request #{data?.beading_request_id || "-"} • Expires{" "}
                {safeDate(data?.expires_at)}
              </div>
            </div>

            <span
              className={`badge rounded-pill px-3 py-2 ${statusBadgeClass(
                data?.beading_request_status
              )}`}
            >
              {statusText(data?.beading_request_status)}
            </span>

            <button className="bdm-close btn btn-light btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="bdm-body">
            <div className="row g-3">

              {/* 👤 VENDOR (ONLY WHEN ACCEPTED) */}
              {isAccepted(data?.beading_request_status) && (
                <div className="col-lg-4 col-md-5 col-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h6 className="fw-bold mb-2">Vendor</h6>

                      <div className="mb-2">
                        <small className="text-muted">Name</small>
                        <div className="fw-semibold">
                          {data?.vendor_name || "-"}
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">Email</small>
                        <div className="fw-semibold">
                          {data?.vendor_email || "-"}
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">Phone</small>
                        <div className="fw-semibold">
                          {data?.vendor_phone || "-"}
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => copy(data?.vendor_phone)}
                          disabled={!data?.vendor_phone}
                        >
                          Copy Phone
                        </button>

                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => copy(data?.vendor_email)}
                          disabled={!data?.vendor_email}
                        >
                          Copy Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📄 REQUEST DETAILS */}
              <div
                className={`col-12 ${
                  isAccepted(data?.beading_request_status)
                    ? "col-lg-8 col-md-7"
                    : "col-lg-12"
                }`}
              >
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-2">Request</h6>

                    <div className="mb-2">
                      <small className="text-muted">Title</small>
                      <div className="fw-semibold">
                        {data?.beading_request_title || "-"}
                      </div>
                    </div>

                    <div>
                      <small className="text-muted">Description</small>
                      <div>{data?.beading_request_description || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 STATS */}
              <div className="col-md-4 col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <small className="text-muted">Budget</small>
                    <div className="fw-bold">
                      ₹{data?.beading_budget_min || 0} - ₹
                      {data?.beading_budget_max || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <small className="text-muted">Location</small>
                    <div className="fw-bold">
                      {data?.beading_location || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <small className="text-muted">Expires</small>
                    <div className="fw-bold">
                      {safeDate(data?.expires_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🖼 IMAGES */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold mb-0">Images</h6>
                      <small className="text-muted">
                        {imgs.length} files
                      </small>
                    </div>

                    {imgs.length === 0 ? (
                      <div className="text-muted">No images uploaded.</div>
                    ) : (
                      <div className="row g-2">
                        {imgs.map((img, i) => {
                          const src = `${baseURL}beading_images/${img}`;
                          return (
                            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                              <a href={src} target="_blank" rel="noreferrer">
                                <img
                                  src={src}
                                  alt="beading"
                                  className="img-fluid rounded border"
                                  style={{ height: 90, objectFit: "cover" }}
                                />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="bdm-footer">
            <button className="btn btn-outline-dark" onClick={() => copy(data?.beading_request_id)}>
              Copy Request ID
            </button>
            <button className="btn btn-danger" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style jsx global>{`
        .bdm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.65);
          z-index: 9998;
        }
        .bdm-wrap {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 16px;
        }
        .bdm-card {
          width: 100%;
          max-width: 980px;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          animation: pop .18s ease-out;
        }
        .bdm-header {
          position: relative;
          padding: 16px;
          background: linear-gradient(135deg,#0f172a,#1e40af);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .bdm-close {
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .bdm-body {
          padding: 16px;
          background: #f8fafc;
          max-height: 70vh;
          overflow: auto;
        }
        .bdm-footer {
          padding: 12px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #e5e7eb;
        }
        @keyframes pop {
          from { transform: translateY(10px) scale(.97); opacity:0 }
          to { transform: translateY(0) scale(1); opacity:1 }
        }
      `}</style>
    </>
  );
};

export default BeadingDetailsModal;
