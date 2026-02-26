import React, { useMemo, useState } from "react";
import { useStoreGstMutation } from "@/redux/features/gstApi";

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

// ✅ GSTIN format validation (15 chars)
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const GSTVerification = () => {
  const [gstin, setGstin] = useState("27BSSPR5055B1ZF");
  const [data, setData] = useState(null); // external api data (json.data)
  const [apiMessage, setApiMessage] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // ✅ confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ✅ store api
  const [storeGst, { isLoading: isSaving }] = useStoreGstMutation();

  // ✅ external token
  const TOKEN = "5e2f895cd5c0abc9437a416160fb5344";

  const upperGstin = useMemo(
    () => String(gstin || "").trim().toUpperCase(),
    [gstin]
  );

  const natureOfBusiness = useMemo(() => {
    const nba = data?.nba;
    return Array.isArray(nba) ? nba.join(", ") : "-";
  }, [data]);

  const address = useMemo(() => data?.pradr?.adr || "-", [data]);

  const handleCheck = async () => {
    try {
      setError("");
      setApiMessage("");
      setData(null);

      if (!upperGstin) {
        setError("Please enter GSTIN.");
        return;
      }

      // ✅ STRICT format validation
      if (!GSTIN_REGEX.test(upperGstin)) {
        setError("Invalid GSTIN format. Example: 27ABCDE1234F1Z5");
        return;
      }

      setIsChecking(true);

      const url = `https://sheet.gstincheck.co.in/check/${TOKEN}/${upperGstin}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const json = await res.json();

      if (!res.ok || json?.flag === false) {
        setError(json?.message || "GSTIN not found / API error");
        return;
      }

      setApiMessage(json?.message || "");
      setData(json?.data || null);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setIsChecking(false);
    }
  };

  // ✅ open confirm modal
  const openConfirm = () => {
    if (!data) {
      setError("First check GSTIN and get details, then save.");
      return;
    }
    setConfirmOpen(true);
  };

  // ✅ call backend store api (upsert)
  const handleSaveConfirmed = async () => {
    try {
      const payload = {
        gst_gstin: data?.gstin || upperGstin,
        gst_legal_name: data?.lgnm || null,
        gst_trade_name: data?.tradeNam || null,
        gst_status: data?.sts || null,
        gst_registration_date: data?.rgdt || null,
        gst_constitution: data?.ctb || null,
        gst_type: data?.dty || null,
        gst_nature_of_business: data?.nba || null,
        gst_principal_address: data?.pradr?.adr || null,
        gst_state_jurisdiction: data?.stj || null,
        gst_central_jurisdiction: data?.ctj || null,
        gst_aadhar_verified: data?.adhrVFlag || null,
        gst_aadhar_verified_date: data?.adhrVdt || null,
        gst_einvoice_status: data?.einvoiceStatus || null,
        gst_field_visit_conducted: data?.isFieldVisitConducted || null,
        gst_ntcrbs: data?.ntcrbs || null,
        gst_ekyc_flag: data?.ekycVFlag || null,

        // ✅ full response store
        gst_full_response: { flag: true, message: apiMessage, data },
      };

      await storeGst(payload).unwrap();

      // ✅ SUCCESS → clear all
      setConfirmOpen(false);
      setData(null);
      setApiMessage("");
      setError("");
      setGstin("");
    } catch (e) {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">GST Verification</h4>
        {data?.sts ? (
          <span
            className={`badge ${
              data.sts === "Active" ? "bg-success" : "bg-secondary"
            }`}
          >
            {toText(data.sts)}
          </span>
        ) : (
          <span className="badge bg-light text-dark">No Result</span>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Enter GSTIN</label>
        <input
          type="text"
          className="form-control"
          value={gstin}
          onChange={(e) => {
            setGstin(e.target.value);
            setError("");
            setApiMessage("");
            setData(null);
          }}
          placeholder="27ABCDE1234F1Z5"
          maxLength={15}
        />

        <small className="text-muted d-block mt-1">
          Example: 27ABCDE1234F1Z5 (format only)
        </small>

        {/* ✅ format-only examples (not real gstins) */}
      
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Check GSTIN"}
        </button>

        <button
          className="btn btn-success"
          onClick={openConfirm}
          disabled={!data || isSaving}
        >
          {isSaving ? "Saving..." : "Save Info"}
        </button>
      </div>

      {apiMessage && (
        <div className="alert alert-success mt-3 mb-0">{apiMessage}</div>
      )}
      {error && (
        <div className="alert alert-danger mt-3 mb-0">{error}</div>
      )}

      {data && (
        <div className="mt-4">
          <h5 className="mb-2">Important GST Details</h5>

          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <tbody>
                <tr>
                  <th style={{ width: 260 }}>GSTIN</th>
                  <td>{toText(data.gstin)}</td>
                </tr>
                <tr>
                  <th>Legal Name</th>
                  <td>{toText(data.lgnm)}</td>
                </tr>
                <tr>
                  <th>Trade Name</th>
                  <td>{toText(data.tradeNam)}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{toText(data.sts)}</td>
                </tr>
                <tr>
                  <th>Type (dty)</th>
                  <td>{toText(data.dty)}</td>
                </tr>
                <tr>
                  <th>Registration Date (rgdt)</th>
                  <td>{toText(data.rgdt)}</td>
                </tr>
                <tr>
                  <th>Constitution (ctb)</th>
                  <td>{toText(data.ctb)}</td>
                </tr>
                <tr>
                  <th>Nature of Business (nba)</th>
                  <td>{natureOfBusiness}</td>
                </tr>
                <tr>
                  <th>Principal Address</th>
                  <td>{address}</td>
                </tr>
                <tr>
                  <th>State Jurisdiction (stj)</th>
                  <td>{toText(data.stj)}</td>
                </tr>
                <tr>
                  <th>Central Jurisdiction (ctj)</th>
                  <td>{toText(data.ctj)}</td>
                </tr>
                <tr>
                  <th>Aadhaar Verified</th>
                  <td>
                    <div>
                      <strong>Flag:</strong> {toText(data.adhrVFlag)}
                    </div>
                    <div>
                      <strong>Date:</strong> {toText(data.adhrVdt)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>eInvoice Status</th>
                  <td>{toText(data.einvoiceStatus)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Confirm Modal */}
      {confirmOpen && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm GST Save</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmOpen(false)}
                    disabled={isSaving}
                  />
                </div>

                <div className="modal-body">
                  <p className="mb-2">
                    Are you sure you want to save these GST details?
                  </p>

                  <div className="border rounded p-2 bg-light">
                    <div>
                      <strong>GSTIN:</strong> {toText(data?.gstin)}
                    </div>
                    <div>
                      <strong>Legal Name:</strong> {toText(data?.lgnm)}
                    </div>
                    <div>
                      <strong>Trade Name:</strong> {toText(data?.tradeNam)}
                    </div>
                    <div>
                      <strong>Status:</strong> {toText(data?.sts)}
                    </div>
                    <div>
                      <strong>Reg Date:</strong> {toText(data?.rgdt)}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setConfirmOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSaveConfirmed}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Yes, Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default GSTVerification;