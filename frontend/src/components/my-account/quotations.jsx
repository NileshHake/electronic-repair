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
    switch (status) {
      case 1:
      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 2:
      case "Approved":
        return <span className="badge bg-success">Approved</span>;
      case 3:
      case "Rejected":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
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
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={refetch}
        >
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
              list.map((q, idx) => (
                <tr key={q.quotation_id || idx}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold text-primary">
                    {q.quotation_no}
                  </td>
                  <td>{q.create_date}</td>
                  <td>{q.expire_date}</td>
                  <td className="fw-bold text-success">
                    ₹ {Number(q.grand_total || 0).toFixed(2)}
                  </td>
                  <td>{getStatusBadge(q.quotation_status)}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-success px-3"
                      disabled={isDownloading}
                      onClick={() =>
                        downloadPdf(q.quotation_id)
                      }
                    >
                      {isDownloading ? "..." : "Download"}
                    </button>
                  </td>
                </tr>
              ))
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
