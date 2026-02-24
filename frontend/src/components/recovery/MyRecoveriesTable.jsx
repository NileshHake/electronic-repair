"use client";

import React, { useMemo, useState } from "react";
import { useGetMyRecoveriesQuery, useLazyDownloadQuotationBillPdfQuery } from "@/redux/features/recoveryApi";
import RecoveryViewModal from "./RecoveryViewModal";
import { formatDateTime } from "@/helpers/date_and_time";

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const MyRecoveriesTable = () => {
  const { data, isLoading, isError } = useGetMyRecoveriesQuery();

  // API might return: array OR {data: array}
  const recoveries = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ✅ PDF download hook
  const [downloadPdf, { isFetching: isPdfDownloading }] = useLazyDownloadQuotationBillPdfQuery();

  const openView = (row) => {
    setSelected(row);
    setIsOpen(true);
  };

  const closeView = () => {
    setIsOpen(false);
    setSelected(null);
  };

  // ✅ Download handler (Quotation/Billing)
  const handleDownload = async (docId, filePrefix = "Doc") => {
    try {
      if (!docId) return;

      const res = await downloadPdf(docId);
      if (!res?.data) return;

      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filePrefix}-${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log("Download failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" />
        <div className="mt-2">Loading recoveries...</div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-danger py-3">Failed to load recoveries!</div>;
  }

  if (recoveries.length === 0) {
    return <div className="py-3">No recoveries found.</div>;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 80 }}>#</th>

              <th>Problem</th>
              <th>Received Date</th>
              <th>Workflow</th>
              <th>Stage</th>
              <th>Vendor</th>

              {/* ✅ Download buttons */}
              <th style={{ width: 260 }} className="text-center">
                Download
              </th>

              {/* keep modal view if you want */}
              <th style={{ width: 100 }} className="text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recoveries.map((r, idx) => {
              const quotationId = r?.recovery_quotation_id;
              const billId = r?.recovery_bill_id;

              return (
                <tr key={r.recovery_id ?? idx}>
                  <td>{idx + 1}</td>

                  <td style={{ maxWidth: 260 }}>
                    <div className="text-truncate" title={toText(r.recovery_problem_description)}>
                      {toText(r.recovery_problem_description)}
                    </div>
                  </td>

                  <td>{r.recovery_received_date ? formatDateTime(r.recovery_received_date) : "-"}</td>

                  <td>{toText(r.workflow_name ?? r.workflow_title ?? r.workflow_id)}</td>
                  <td>{toText(r.workflow_child_name ?? r.workflow_stage_name ?? r.workflow_child_id)}</td>

                  <td>{toText(r.recovery_created_by_name ?? r.vendor_name ?? r.recovery_created_by)}</td>

                  {/* ✅ DOWNLOAD ONLY */}
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      {quotationId ? (
                        <button
                          type="button"
                          className="btn btn-sm fw-bold text-white"
                          style={{ backgroundColor: "#D92D20", borderRadius: 8 }}
                          disabled={isPdfDownloading}
                          onClick={() => handleDownload(quotationId, "Quotation")}
                          title="Download Quotation PDF"
                        >
                          ⬇ Quotation
                        </button>
                      ) : (
                        <span className="badge bg-light text-muted border">No Quotation</span>
                      )}

                      {billId ? (
                        <button
                          type="button"
                          className="btn btn-sm fw-bold text-white"
                          style={{ backgroundColor: "#0FA958", borderRadius: 8 }}
                          disabled={isPdfDownloading}
                          onClick={() => handleDownload(billId, "Billing")}
                          title="Download Billing PDF"
                        >
                          ⬇ Billing
                        </button>
                      ) : (
                        <span className="badge bg-light text-muted border">No Billing</span>
                      )}
                    </div>
                  </td>

                  {/* optional view */}
                  <td className="text-center">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => openView(r)}>
                      👁
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RecoveryViewModal isOpen={isOpen} toggle={closeView} recovery={selected} />
    </>
  );
};

export default MyRecoveriesTable;