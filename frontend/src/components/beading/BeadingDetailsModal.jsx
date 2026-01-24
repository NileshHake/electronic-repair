"use client";

import React, { useEffect, useMemo } from "react";

const statusText = (s) => {
  const n = Number(s);
  if (n === 0) return "Pending";
  if (n === 1) return "Accepted";
  if (n === 2) return "In Progress";
  if (n === 3) return "Completed";
  if (n === 4) return "Rejected";
  return "Unknown";
};

const statusClass = (s) => {
  const n = Number(s);
  if (n === 0) return "badge bg-warning text-dark";
  if (n === 1) return "badge bg-primary";
  if (n === 2) return "badge bg-info text-dark";
  if (n === 3) return "badge bg-success";
  if (n === 4) return "badge bg-danger";
  return "badge bg-secondary";
};

const parseImgs = (imagesString) => {
  if (!imagesString) return [];
  return String(imagesString)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

const BeadingDetailsModal = ({ open, onClose, data, imgBaseUrl }) => {
  const baseURL = useMemo(() => {
    const u = imgBaseUrl || "";
    return u.endsWith("/") ? u : u + "/";
  }, [imgBaseUrl]);

  // ✅ ESC close + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open || !data) return null;

  const imgs = parseImgs(data?.beading_request_images);

  return (
    <>
      {/* Backdrop */}
      <div className="bdm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="bdm-wrap" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="bdm-card" onClick={(e) => e.stopPropagation()}>
          {/* Top Gradient Header */}
          <div className="bdm-top">
            <div className="bdm-top-left">
              <div className="bdm-title">Beading Request Details</div>
              <div className="bdm-sub">
                Request #{data?.beading_request_id || "-"} •{" "}
                <span className={statusClass(data?.beading_request_status)}>
                  {statusText(data?.beading_request_status)}
                </span>
              </div>
            </div>

            <button className="btn btn-sm btn-light bdm-close" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="bdm-body">
            <div className="row g-3">
              <div className="col-12">
                <div className="bdm-label">Title</div>
                <div className="bdm-value fw-bold">{data?.beading_request_title || "-"}</div>
              </div>

              <div className="col-12">
                <div className="bdm-label">Description</div>
                <div className="bdm-value">{data?.beading_request_description || "-"}</div>
              </div>

              <div className="col-md-4">
                <div className="bdm-mini">
                  <div className="bdm-mini-label">Budget</div>
                  <div className="bdm-mini-value">
                    ₹{data?.beading_budget_min || 0} - ₹{data?.beading_budget_max || 0}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="bdm-mini">
                  <div className="bdm-mini-label">Location</div>
                  <div className="bdm-mini-value">{data?.beading_location || "-"}</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="bdm-mini">
                  <div className="bdm-mini-label">Expires At</div>
                  <div className="bdm-mini-value">
                    {data?.expires_at ? new Date(data.expires_at).toLocaleDateString() : "-"}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="bdm-label mb-2">Images</div>
                  <div className="text-muted small">{imgs.length} files</div>
                </div>

                {imgs.length === 0 ? (
                  <div className="text-muted">No images uploaded.</div>
                ) : (
                  <div className="bdm-grid">
                    {imgs.map((img, i) => {
                      const src = `${baseURL}beading_images/${img}`;
                      return (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="bdm-imgbox"
                          title="Open image"
                        >
                          <img
                            src={src}
                            alt="beading"
                            className="bdm-img"
                            onError={(e) => {
                              e.currentTarget.style.opacity = 0.2;
                            }}
                          />
                          <span className="bdm-open">Open</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bdm-footer">
            <button className="btn btn-outline-dark" onClick={onClose}>
              Close
            </button>

            <button
              className="btn btn-dark"
              onClick={() => {
                // optional: copy id
                const id = data?.beading_request_id;
                if (id) navigator.clipboard?.writeText(String(id));
              }}
            >
              Copy Request ID
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .bdm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.72);
          backdrop-filter: blur(8px);
          z-index: 9998;
          animation: bdmFade 180ms ease-out;
        }

        .bdm-wrap {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 9999;
        }

        .bdm-card {
          width: 100%;
          max-width: 980px;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
          transform-origin: center;
          animation: bdmPop 220ms ease-out;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .bdm-top {
          padding: 16px 16px 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #0ea5e9);
          color: #fff;
        }

        .bdm-title {
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 0.2px;
        }

        .bdm-sub {
          margin-top: 6px;
          font-size: 12px;
          opacity: 0.95;
        }

        .bdm-close {
          border-radius: 12px;
          font-weight: 900;
        }

        .bdm-body {
          padding: 16px;
          max-height: 70vh;
          overflow: auto;
        }

        .bdm-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .bdm-value {
          margin-top: 4px;
          color: #0f172a;
          line-height: 1.55;
        }

        .bdm-mini {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          padding: 12px;
          background: rgba(15, 23, 42, 0.02);
        }

        .bdm-mini-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 800;
        }

        .bdm-mini-value {
          margin-top: 6px;
          font-weight: 900;
          color: #0f172a;
        }

        .bdm-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 992px) {
          .bdm-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 576px) {
          .bdm-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .bdm-imgbox {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
          display: block;
          text-decoration: none;
        }

        .bdm-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
          transition: transform 200ms ease;
        }

        .bdm-imgbox:hover .bdm-img {
          transform: scale(1.05);
        }

        .bdm-open {
          position: absolute;
          left: 10px;
          bottom: 10px;
          background: rgba(15, 23, 42, 0.75);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 999px;
          opacity: 0;
          transform: translateY(6px);
          transition: all 160ms ease;
        }

        .bdm-imgbox:hover .bdm-open {
          opacity: 1;
          transform: translateY(0);
        }

        .bdm-footer {
          padding: 14px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: #fff;
        }

        @keyframes bdmFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bdmPop {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default BeadingDetailsModal;
