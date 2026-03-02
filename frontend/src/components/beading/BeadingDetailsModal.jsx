"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
} from "reactstrap";

import {
  useGetBeadingSingleQuery,
  useGetVendorOffersByRequestQuery,
  useAcceptVendorOfferMutation,
  useUpdateVendorOfferMutation,
} from "@/redux/features/beadingApi";

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

const offerStatusText = (s) => {
  const n = Number(s);
  if (n === 0) return "Offered";
  if (n === 1) return "Accepted";
  if (n === 2) return "Rejected";
  if (n === 3) return "Cancelled";
  return "Unknown";
};

const offerBadgeClass = (s) => {
  const n = Number(s);
  if (n === 0) return "bg-info";
  if (n === 1) return "bg-success";
  if (n === 2) return "bg-danger";
  if (n === 3) return "bg-secondary";
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
const safeDateTime = (d) => (d ? new Date(d).toLocaleString() : "-");

/* ================= COMPONENT ================= */
/**
 * ✅ Customer side:
 * - Shows all offers (from /beading/:id/vendor-offers)
 * - Customer can Accept one offer (PUT /beading/vendor-accept)
 * - Customer can Reject offer (PUT /beading/vendor-offer/update with status=2)
 * - Auto refresh after accept/reject (refetch + tag invalidation)
 */
const BeadingDetailsModalCustomer = ({
  open,
  onClose,
  data,
  imgBaseUrl,
}) => {
  /* ✅ ALL HOOKS FIRST */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const requestId = data?.beading_request_id;

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

  // reset confirm modal on close
  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      setSelectedOffer(null);
    }
  }, [open]);

  // ✅ freshest master data (status, accepted vendor etc.)
  const { data: singleReq } = useGetBeadingSingleQuery(requestId, {
    skip: !open || !requestId,
  });

  // ✅ freshest offers list
  const {
    data: offersRes,
    isFetching: offersLoading,
    refetch: refetchOffers,
  } = useGetVendorOffersByRequestQuery(requestId, {
    skip: !open || !requestId,
  });

  const [acceptVendorOffer, { isLoading: acceptLoading }] =
    useAcceptVendorOfferMutation();

  const [updateVendorOffer, { isLoading: rejectLoading }] =
    useUpdateVendorOfferMutation();

  // ✅ display data (prefer latest single)
  const view = singleReq || data;

  // ✅ normalize offers array
  const vendorOffers = useMemo(() => {
    if (Array.isArray(offersRes)) return offersRes;
    if (Array.isArray(offersRes?.data)) return offersRes.data;
    return [];
  }, [offersRes]);

  const vendorOffersSorted = useMemo(() => {
    const arr = [...vendorOffers];
    arr.sort(
      (a, b) =>
        Number(a?.vendor_beading_amount || 0) -
        Number(b?.vendor_beading_amount || 0)
    );
    return arr;
  }, [vendorOffers]);

  const imgs = useMemo(
    () => parseImgs(view?.beading_request_images),
    [view?.beading_request_images]
  );

  const hasAcceptedVendor = Boolean(view?.beading_vender_accepted_id);

  const openConfirm = (offerRow) => {
    setSelectedOffer(offerRow);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (acceptLoading) return;
    setConfirmOpen(false);
    setSelectedOffer(null);
  };

  const handleConfirmAccept = async () => {
    try {
      if (!requestId) return;
      if (!selectedOffer?.vendor_id) return;

      await acceptVendorOffer({
        beading_request_id: requestId,
        vendor_id: selectedOffer.vendor_id,
        br_vendor_id: selectedOffer?.br_vendor_id, // keep if backend expects it
      }).unwrap();

      closeConfirm();

      // ✅ refresh instantly so accepted_at/status show immediately
      await refetchOffers();
      // Optional: keep modal open to show changes
      // onClose?.();
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  const handleReject = async (offerRow) => {
    try {
      if (!offerRow?.br_vendor_id) return;

      await updateVendorOffer({
        br_vendor_id: offerRow.br_vendor_id,
        beading_request_id: requestId,
        vendor_offer_status: 2, // ✅ Rejected
      }).unwrap();

      await refetchOffers();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  if (!open || !data) return null;

  return (
    <>
      {/* MAIN MODAL */}
      <Modal
        isOpen={open}
        toggle={onClose}
        centered
        backdrop="static"
        keyboard
        size="lg"
        className="bdm-modal"
      >
        {/* HEADER */}
        <div className="bdm-header">
          <div>
            <h5 className="mb-1 text-white fw-bold">Beading Request Details</h5>
            <div className="small text-white-50">
              Request{" "}
              <span className="fw-semibold">#{view?.beading_request_id || "-"}</span>{" "}
              • Expires{" "}
              <span className="fw-semibold">{safeDate(view?.expires_at)}</span>
            </div>
          </div>

          <span
            className={`badge rounded-pill px-3 py-2 ${statusBadgeClass(
              view?.beading_request_status
            )}`}
          >
            {statusText(view?.beading_request_status)}
          </span>

          <button className="bdm-close btn btn-light btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <ModalBody className="bdm-body">
          <div className="row g-3">
            {/* ACCEPTED VENDOR CARD */}
            {hasAcceptedVendor && (
              <div className="col-lg-3 col-md-5 col-12">
                <div className="card h-100 border shadow-sm rounded-3">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold">Selected Vendor</div>
                      <i className="ri-store-2-line text-muted"></i>
                    </div>

                    <div className="mb-2">
                      <div className="text-muted small">Name</div>
                      <div className="fw-semibold">
                        {view?.acceptedVendor?.user_name || view?.vendor_name || "-"}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-muted small">Email</div>
                      <div
                        className="fw-semibold text-truncate"
                        title={view?.acceptedVendor?.user_email || view?.vendor_email || ""}
                      >
                        {view?.acceptedVendor?.user_email || view?.vendor_email || "-"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Phone</div>
                      <div className="fw-semibold">
                        {view?.acceptedVendor?.user_phone_number || view?.vendor_phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REQUEST */}
            <div
              className={`col-12 ${hasAcceptedVendor ? "col-lg-9 col-md-7" : "col-lg-12 col-md-12"
                }`}
            >
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-bold">Request</div>
                    <span className="text-muted">📄</span>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Title</small>
                    <div className="fw-bold">{view?.beading_request_title || "-"}</div>
                  </div>

                  <div>
                    <small className="text-muted">Description</small>
                    <div style={{ lineHeight: 1.6 }}>
                      {view?.beading_request_description || "-"}
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
                    ₹{Number(view?.beading_budget_min || 0)} - ₹{Number(view?.beading_budget_max || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Location</small>
                  <div className="fw-bold">{view?.beading_location || "-"}</div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <small className="text-muted">Expires At</small>
                  <div className="fw-bold">{safeDate(view?.expires_at)}</div>
                </div>
              </div>
            </div>

            {/* OFFERS TABLE */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-bold">Vendor Beading Offers</div>
                    <div className="text-muted small">{vendorOffersSorted.length} offers</div>
                  </div>

                  {offersLoading ? (
                    <div className="text-muted">Loading offers...</div>
                  ) : vendorOffersSorted.length === 0 ? (
                    <div className="text-muted">No vendor offers yet.</div>
                  ) : (
                    <div
                      className="table-responsive"
                      style={{ maxHeight: 260, overflowY: "auto" }}
                    >
                      <table className="table table-sm align-middle mb-0">
                        <thead
                          className="table-light sticky-top"
                          style={{ top: 0, zIndex: 1 }}
                        >
                          <tr className="text-muted small text-uppercase">
                            <th style={{ width: 40 }}>#</th>
                            <th>Vendor</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Note</th>
                            <th className="text-end">Amount (₹)</th>
                            <th className="text-end">Offer Time</th>
                            <th className="text-end">Status</th>
                            {Number(view?.beading_request_status) === 0 && (
                              <th className="text-end">Action</th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {vendorOffersSorted.map((v, idx) => {
                            const amt = Number(v?.vendor_beading_amount || 0);
                            const st = Number(v?.vendor_offer_status ?? 0);

                            const isSelected =
                              Number(view?.beading_vender_accepted_id) ===
                              Number(v?.vendor_id);
                            const requestAccepted = Number(view?.beading_request_status) === 1;
                            return (
                              <tr key={v?.br_vendor_id || idx}>
                                <td>{idx + 1}</td>

                                <td className="fw-semibold">
                                  {v?.vendor_name || "-"}
                                  {isSelected && (
                                    <Badge color="success" className="ms-2">
                                      Selected
                                    </Badge>
                                  )}
                                </td>

                                <td>{v?.vendor_phone || "-"}</td>

                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: 180 }}
                                  title={v?.vendor_email || ""}
                                >
                                  {v?.vendor_email || "-"}
                                </td>

                                <td style={{ maxWidth: 220 }}>
                                  <div className="text-truncate" title={v?.vendor_note || ""}>
                                    {v?.vendor_note || "-"}
                                  </div>
                                </td>

                                <td className="text-end fw-bold">₹ {amt.toFixed(0)}</td>

                                <td className="text-end text-muted small">
                                  {safeDateTime(v?.offered_at)}
                                </td>

                                <td className="text-end">
                                  <span className={`badge ${offerBadgeClass(st)} rounded-pill`}>
                                    {offerStatusText(st)}
                                  </span>
                                </td>

                                <td className="text-end">
                                  {requestAccepted || st === 2 ? (
                                    // 🔴 If request already accepted OR this offer rejected
                                    <span>-</span>
                                  ) : (
                                    <div className="d-flex justify-content-end gap-2">
                                      <Button
                                        size="sm"
                                        color="success"
                                        onClick={() => openConfirm(v)}
                                        disabled={acceptLoading || rejectLoading || isSelected}
                                      >
                                        Accept
                                      </Button>

                                      <Button
                                        size="sm"
                                        color="danger"
                                        outline
                                        onClick={() => handleReject(v)}
                                        disabled={acceptLoading || rejectLoading || isSelected}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {hasAcceptedVendor && (
                    <div className="text-muted small mt-2">
                      ✅ One vendor has been selected. You can continue the process from the
                      selected vendor.
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
                            <a
                              href={src}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none"
                            >
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
          <div />
          <button className="btn btn-danger" onClick={onClose}>
            Close
          </button>
        </ModalFooter>
      </Modal>

      {/* CONFIRM ACCEPT MODAL */}
      <Modal isOpen={confirmOpen} toggle={closeConfirm} centered backdrop="static">
        <div className="modal-header bg-light">
          <h5 className="modal-title">Confirm Accept</h5>
          <button type="button" className="btn-close" onClick={closeConfirm} />
        </div>

        <ModalBody>
          <div className="fw-semibold mb-2">
            Are you sure you want to accept this vendor offer?
          </div>

          <div className="text-muted small">
            Request ID: <span className="fw-semibold">#{view?.beading_request_id}</span>
          </div>

          {selectedOffer && (
            <div className="mt-2 p-2 border rounded bg-white">
              <div className="small text-muted">Selected Vendor</div>
              <div className="fw-semibold">{selectedOffer?.vendor_name || "-"}</div>
              <div className="text-muted small">
                ₹ {Number(selectedOffer?.vendor_beading_amount || 0).toFixed(0)}
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

export default BeadingDetailsModalCustomer;