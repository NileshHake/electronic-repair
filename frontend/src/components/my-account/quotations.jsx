import React from "react";
import {
  useGetCustomerQuotationsQuery,
  useLazyDownloadQuotationInvoiceQuery,
} from "@/redux/features/quotationApi";
import { toast } from "react-toastify";

const QuotationTab = () => {
  const { data, isLoading, isError, error, refetch } =
    useGetCustomerQuotationsQuery();

  const [downloadInvoice, { isFetching: isDownloading }] =
    useLazyDownloadQuotationInvoiceQuery();

  const list =
    data?.data ||
    data?.result ||
    data?.rows ||
    data?.quotations ||
    data ||
    [];

  const downloadPdf = async (quotationId) => {
    try {
      const blob = await downloadInvoice(quotationId).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation-${quotationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Quotation downloaded successfully");
    } catch (e) {
      toast.error("Download failed");
    }
  };

  const getStatusBadge = (status) => {
    const s = Number(status);

    switch (s) {
      case 0:
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 1:
        return <span className="badge bg-secondary">New</span>;
      case 2:
        return <span className="badge bg-primary">Accept</span>;
      case 3:
        return <span className="badge bg-success">Final</span>;
      case 4:
        return <span className="badge bg-danger">Reject</span>;
      case 5:
        return <span className="badge bg-info text-dark">In Progress</span>;
      default:
        return <span className="badge bg-dark">Unknown</span>;
    }
  };

  if (isLoading) return <p>Loading quotations...</p>;

  if (isError) {
    return (
      <div className="alert alert-danger">
        {error?.data?.message || "Server error"}
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      {/* Header */}
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold">My Quotations</h5>
        <button className="btn btn-outline-primary btn-sm" onClick={refetch}>
          Refresh
        </button>
      </div>

      {/* Scrollable Table */}
      <div
        className="table-responsive"
        style={{
          maxHeight: "450px",
          overflowY: "auto",
        }}
      >
        <table className="table align-middle table-hover mb-0">
          <thead
            className="table-light"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              <th>#</th>
              <th>Quotation No</th>
              <th>Date</th>
              <th>Expire</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-center">Download</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(list) && list.length > 0 ? (
              list.map((q, idx) => {
                const status = Number(q.quotation_status);

                // ✅ show download only after Accept (2) / In Progress (5) / Final (3)
                const canDownload = [2, 5, 3].includes(status);

                return (
                  <tr key={q.quotation_id || idx}>
                    <td>{idx + 1}</td>

                    <td className="fw-semibold text-primary">{q.quotation_no}</td>

                    <td>{q.create_date}</td>
                    <td>{q.expire_date}</td>

                    <td className="fw-bold text-success">
                      ₹ {Number(q.grand_total || 0).toFixed(2)}
                    </td>

                    <td>{getStatusBadge(status)}</td>

                    <td className="text-center">
                      {canDownload ? (
                        <button
                          className="btn btn-sm btn-success px-3"
                          disabled={isDownloading}
                          onClick={() => downloadPdf(q.quotation_id)}
                        >
                          {isDownloading ? "..." : "Download"}
                        </button>
                      ) : (
                        <span className="badge bg-light text-muted border">
                          Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No quotations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Count */}
      {Array.isArray(list) && list.length > 0 && (
        <div className="card-footer bg-light text-end small">
          Total Quotations: <strong>{list.length}</strong>
        </div>
      )}
    </div>
  );
};

export default QuotationTab;