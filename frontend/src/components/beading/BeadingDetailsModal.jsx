"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useVendorAcceptBeadingMutation } from "@/redux/features/beadingApi";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

/* ================= HELPERS ================= */
const statusText = (s) => {
  const n = Number(s);
  if (n === 0) return "Pending";
  if (n === 1) return "Accepted";
  if (n === 2) return "In Progress";
  if (n === 3) return "Completed";
  if (n === 4) return "Rejected";
  return "Unknown";
};

const statusBadgeClass = (s) => {
  const n = Number(s);
  if (n === 0) return "bg-warning text-dark";
  if (n === 1) return "bg-primary";
  if (n === 2) return "bg-info text-dark";
  if (n === 3) return "bg-success";
  if (n === 4) return "bg-danger";
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

const parseVendorDetails = (vendorDetails) => {
  if (!vendorDetails) return [];
  try {
    const parsed =
      typeof vendorDetails === "string" ? JSON.parse(vendorDetails) : vendorDetails;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ================= COMPONENT ================= */
const BeadingDetailsModal = ({
  open,
  onClose,
  data,
  imgBaseUrl,
  viewerType = "customer", // "vendor" | "customer"
  onAccept,
}) => {
  /* ✅ ALL HOOKS FIRST */
  const [amountOpen, setAmountOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [vendorAcceptBeading, { isLoading: acceptLoading }] =
    useVendorAcceptBeadingMutation();

  const baseURL = useMemo(() => {
    const u = imgBaseUrl || "";
    return u.endsWith("/") ? u : u + "/";
  }, [imgBaseUrl]);

  // ESC close + body lock
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

  // reset when main modal closes
  useEffect(() => {
    if (!open) {
      setAmountOpen(false);
      setAmount("");
      setTouched(false);
      setConfirmOpen(false);
      setSelectedVendor(null);
    }
  }, [open]);

  /* ✅ derive values safely (even if data is null) */
  const imgs = useMemo(
    () => parseImgs(data?.beading_request_images),
    [data?.beading_request_images]
  );

  const min = useMemo(
    () => Number(data?.beading_budget_min || 0),
    [data?.beading_budget_min]
  );
  const max = useMemo(
    () => Number(data?.beading_budget_max || 0),
    [data?.beading_budget_max]
  );

  const vendorBids = useMemo(
    () => parseVendorDetails(data?.beading_vendor_details),
    [data?.beading_vendor_details]
  );

  const vendorBidsSorted = useMemo(() => {
    const arr = [...vendorBids];
    arr.sort((a, b) => {
      const aAmt = Number(a?.vendor_beading_amount ?? a?.vendor_beadding ?? 0);
      const bAmt = Number(b?.vendor_beading_amount ?? b?.vendor_beadding ?? 0);
      return aAmt - bAmt;
    });
    return arr;
  }, [vendorBids]);

  const copy = (val) => val && navigator.clipboard?.writeText(String(val));

  /* ===== vendor accept validations ===== */
  const amountNum = Number(amount);
  const isValid =
    amount !== "" &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    (max === 0 || (amountNum >= min && amountNum <= max));

  const amountError = () => {
    if (!touched) return "";
    if (!amount) return "Please enter your beading amount.";
    if (!Number.isFinite(amountNum) || amountNum <= 0) return "Amount must be a valid number.";
    if (max !== 0 && (amountNum < min || amountNum > max))
      return `Amount should be between ₹${min} and ₹${max}.`;
    return "";
  };

  const openAmountModal = () => {
    setAmountOpen(true);
    setTouched(false);
  };

  const closeAmountModal = () => {
    setAmountOpen(false);
    setAmount("");
    setTouched(false);
  };

  const confirmAccept = () => {
    setTouched(true);
    if (!isValid) return;

    onAccept?.({
      ...data,
      vendor_beading_amount: Number(amount),
    });

    closeAmountModal();
    onClose?.();
  };

  const openConfirm = (vendorRow) => {
    setSelectedVendor(vendorRow);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedVendor(null);
  };

  const handleConfirmAccept = async () => {
    try {
      const payload = {
        beading_request_id: data?.beading_request_id,
        beading_vender_accepted_id: selectedVendor?.vendor_id,
      };

      await vendorAcceptBeading(payload).unwrap();

      closeConfirm();
      onClose?.(); // close main modal
    } catch (err) {
      console.error("Accept failed:", err);
      // toast.error(err?.data?.message || "Accept failed");
    }
  };


  /* ✅ NOW early return is safe */
  if (!open || !data) return null;
  const hasAcceptedVendor = Boolean(data?.beading_vender_accepted_id);
 
  return (
    <>

      <Modal
        isOpen={open}
        toggle={onClose}
        centered
        backdrop="static"
        keyboard={true}
        size="lg"
        className="bdm-modal"
      >
        {/* HEADER */}
        <div className="bdm-header">
          <div>
            <h5 className="mb-1 text-white fw-bold">Beading Request Details</h5>
            <div className="small text-white-50">
              Request{" "}
              <span className="fw-semibold">#{data?.beading_request_id || "-"}</span> • Expires{" "}
              <span className="fw-semibold">{safeDate(data?.expires_at)}</span>
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
        <ModalBody className="bdm-body">
          <div className="row g-3">
            {hasAcceptedVendor && (
              <div className="col-lg-3 col-md-5 col-12">
                <div className="card h-100 border shadow-sm rounded-3">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold">Vendor</div>
                      <i className="ri-store-2-line text-muted"></i>
                    </div>

                    <div className="mb-2">
                      <div className="text-muted small">Name</div>
                      <div className="fw-semibold">{data?.vendor_name || "-"}</div>
                    </div>

                    <div className="mb-2">
                      <div className="text-muted small">Email</div>
                      <div
                        className="fw-semibold text-truncate"
                        title={data?.vendor_email || ""}
                      >
                        {data?.vendor_email || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Phone</div>
                      <div className="fw-semibold">{data?.vendor_phone || "-"}</div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        color="dark"
                        outline
                        onClick={() => copy(data?.vendor_phone)}
                        disabled={!data?.vendor_phone}
                      >
                        <i className="ri-file-copy-line me-1"></i> Phone
                      </Button>

                      <Button
                        size="sm"
                        color="dark"
                        outline
                        onClick={() => copy(data?.vendor_email)}
                        disabled={!data?.vendor_email}
                      >
                        <i className="ri-file-copy-line me-1"></i> Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`col-12 ${hasAcceptedVendor ? "col-lg-9 col-md-7" : "col-lg-12 col-md-12"
              }`}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-bold">Request</div>
                    <span className="text-muted">📄</span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Title</small>
                    <div className="fw-bold">{data?.beading_request_title || "-"}</div>
                  </div>

                  <div>
                    <small className="text-muted">Description</small>
                    <div style={{ lineHeight: 1.6 }}>
                      {data?.beading_request_description || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="col-md-4 col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Budget</small>
                  <div className="fw-bold">
                    ₹{min} - ₹{max}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Location</small>
                  <div className="fw-bold">{data?.beading_location || "-"}</div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Expires At</small>
                  <div className="fw-bold">{safeDate(data?.expires_at)}</div>
                </div>
              </div>
            </div>

            {/* OFFERS */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-bold">Vendor Beading Offers</div>
                    <div className="text-muted small">{vendorBidsSorted.length} offers</div>
                  </div>

                  {vendorBidsSorted.length === 0 ? (
                    <div className="text-muted">No vendor offers yet.</div>
                  ) : (
                    <div className="table-responsive" style={{ maxHeight: 220, overflowY: "auto" }}>
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                          <tr className="text-muted small text-uppercase">
                            <th style={{ width: 40 }}>#</th>
                            <th>Vendor</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th className="text-end">Amount (₹)</th>
                            <th className="text-end">Date</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorBidsSorted.map((v, idx) => {
                            const amt = v?.vendor_beading_amount ?? v?.vendor_beadding ?? 0;
                            const dt = v?.accepted_at
                              ? new Date(v.accepted_at).toLocaleString()
                              : "-";

                            return (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td className="fw-semibold">{v?.vendor_name || "-"}</td>
                                <td>{v?.vendor_phone || "-"}</td>
                                <td className="text-truncate" style={{ maxWidth: 180 }}>
                                  {v?.vendor_email || "-"}
                                </td>
                                <td className="text-end fw-bold">₹ {Number(amt || 0).toFixed(0)}</td>
                                <td className="text-end text-muted small">{dt}</td>
                                <td className="text-end">
                                  {Number(data?.beading_request_status) === 0 && (
                                    <Button
                                      size="sm"
                                      color="success"
                                      onClick={() => openConfirm(v)}
                                      disabled={acceptLoading}
                                    >
                                      Accept
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* IMAGES */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-bold mb-0">Images</h6>
                    <small className="text-muted">{imgs.length} files</small>
                  </div>

                  {imgs.length === 0 ? (
                    <div className="text-muted">No images uploaded.</div>
                  ) : (
                    <div className="row g-2">
                      {imgs.map((img, i) => {
                        const src = `${baseURL}beading_images/${img}`;
                        return (
                          <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                            <a href={src} target="_blank" rel="noreferrer" className="text-decoration-none">
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
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter className="bdm-footer">
          <div>
            {viewerType === "vendor" && Number(data?.beading_request_status) === 0 && (
              <button className="btn btn-success" onClick={openAmountModal}>
                Accept Request
              </button>
            )}
          </div>

          <button className="btn btn-danger" onClick={onClose}>
            Close
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={confirmOpen} toggle={closeConfirm} centered backdrop="static">
        <ModalHeader toggle={closeConfirm} className="bg-light">
          Confirm Accept
        </ModalHeader>

        <ModalBody>
          <div className="fw-semibold mb-2">Are you sure you want to accept this beading?</div>

          <div className="text-muted small">
            Request ID: <span className="fw-semibold">#{data?.beading_request_id}</span>
          </div>

          {selectedVendor && (
            <div className="mt-2 p-2 border rounded bg-white">
              <div className="small text-muted">Selected Vendor</div>
              <div className="fw-semibold">{selectedVendor?.vendor_name || "-"}</div>
              <div className="text-muted small">
                ₹{" "}
                {Number(
                  selectedVendor?.vendor_beading_amount ?? selectedVendor?.vendor_beadding ?? 0
                ).toFixed(0)}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" outline onClick={closeConfirm} disabled={acceptLoading}>
            Cancel
          </Button>

          <Button color="success" onClick={handleConfirmAccept} disabled={acceptLoading}>
            {acceptLoading ? "Accepting..." : "Yes, Accept"}
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx global>{`
  .bdm-modal .modal-content {
    border-radius: 16px;
    overflow: hidden;
    border: 0;
  }
  .bdm-header {
    position: relative;
    padding: 16px;
    background: linear-gradient(135deg, #0f172a, #1e40af);
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
    padding: 12px 16px !important;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
  }
`}</style>

    </>
  );
};

export default BeadingDetailsModal;
