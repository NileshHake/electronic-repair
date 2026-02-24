/* =========================================================
   ✅ ONE PREVIEW MODAL FOR BOTH (REPAIR + RECOVERY)
   - Same UI (simple table style)
   - Items table in Product/Image/Price/Qty/Total format
   - Fetches singleQuotationBilling using correct masterId
   - Download PDF button calls downloadQuotationBillingPdf(masterId)
   - No "Save" button
========================================================= */

import React, { useEffect, useMemo } from "react";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import AuthUser from "../../../helpers/AuthType/AuthUser";
import QRCode from "react-qr-code";

import {
  getSingleQuotationBilling,
  downloadQuotationBillingPdf,
} from "../../../store/QuotationAndBilling";

import { formatDateTime } from "../../../helpers/date_and_time_format";
import { api } from "../../../config";

const QuotationAndBillingPreviewModal = ({
  isOpen,
  toggle,
  RepairData, // ✅ pass singleRepair OR singleRecovery
  mode = "repair", // ✅ "repair" | "recovery"
  type = "Quotation", // ✅ "Quotation" | "Billing"
}) => {
  const dispatch = useDispatch();
  const { BusinessData } = AuthUser();

  const { singleQuotationBilling, loading } = useSelector(
    (state) => state.QuotationBillingReducer
  );

  // ✅ Decide which master id to fetch
  const masterId = useMemo(() => {
    if (!RepairData) return null;

    const isRecovery = String(mode) === "recovery";

    if (isRecovery) {
      return type === "Quotation"
        ? RepairData?.recovery_quotation_id
        : RepairData?.recovery_bill_id;
    }

    // repair
    return type === "Quotation"
      ? RepairData?.repair_quotation_id
      : RepairData?.repair_bill_id;
  }, [RepairData, mode, type]);

  // ✅ Customer Name (from your master data object)
  const customerName = useMemo(() => {
    return RepairData?.customer_name || "-";
  }, [RepairData]);

  // ✅ Fetch single quotation/billing when modal opens
  useEffect(() => {
    if (isOpen && masterId) {
      dispatch(getSingleQuotationBilling(masterId));
    }
  }, [dispatch, isOpen, masterId]);

  const handleDownloadPdf = () => {
    if (masterId) dispatch(downloadQuotationBillingPdf(masterId));
  };

  const grandTotal = Number(
    singleQuotationBilling?.quotation_and_billing_master_grand_total || 0
  );

  const upiLink = `upi://pay?pa=${BusinessData?.user_upi_id || ""}&pn=${
    BusinessData?.user_name || ""
  }&am=${grandTotal.toFixed(2)}&cu=INR`;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle} className="bg-light p-3">
        <div className="d-flex align-items-center justify-content-between w-100" >
          <h5 className="mb-0">
            {type} Preview{" "}
            <span className="text-muted fs-12">
              ({mode === "recovery" ? "Recovery" : "Repair"})
            </span>
          </h5>
        </div>
      </ModalHeader>

      <Form>
        <ModalBody>
          {/* ✅ Top summary table */}
          <div
            className="table-responsive"
            style={{ maxHeight: 240, overflowY: "auto" }}
          >
            <table className="table align-middle table-hover">
              <thead className="table-light text-uppercase text-muted">
                <tr>
                  <th>#</th>
                  <th>{type} No</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th className="text-center">Type</th>
                </tr>
              </thead>

              <tbody>
                {!masterId && !loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No {type} found.
                    </td>
                  </tr>
                )}

                {masterId && (
                  <tr>
                    <td>1</td>

                    <td className="fw-semibold text-primary">
                      {singleQuotationBilling?.quotation_and_billing_master_invoice_number ||
                        `#${singleQuotationBilling?.quotation_and_billing_master_id || "-"}`}
                    </td>

                    <td>{customerName}</td>

                    <td className="fw-bold">₹ {grandTotal.toFixed(2)}</td>

                    <td>
                      {singleQuotationBilling?.quotation_and_billing_master_date
                        ? formatDateTime(
                            singleQuotationBilling.quotation_and_billing_master_date
                          )
                        : "-"}
                    </td>

                    <td className="text-center">
                      {singleQuotationBilling?.quotation_or_billing || type}
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Items table (Product/Image/Price/Qty/Total) */}
          <div className="table-responsive mt-3">
            <table className="table align-middle table-hover">
              <thead className="table-light text-uppercase text-muted">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Loading items...
                    </td>
                  </tr>
                ) : Array.isArray(singleQuotationBilling?.items) &&
                  singleQuotationBilling.items.length > 0 ? (
                  singleQuotationBilling.items.map((item, index) => {
                    // ✅ Support multiple possible field names
                    const productName =
                      item.product_name ||
                      item.product?.product_name ||
                      item.quotation_and_billing_item_name ||
                      "-";

                    const price =
                      Number(
                        item.price ??
                          item.product_price ??
                          item.quotation_and_billing_product_sale_price ??
                          item.quotation_and_billing_product_mrp ??
                          0
                      ) || 0;

                    const qty =
                      Number(
                        item.qty ??
                          item.product_qty ??
                          item.quotation_and_billing_qty ??
                          0
                      ) || 0;

                    const total =
                      Number(
                        item.total ??
                          item.product_total ??
                          item.quotation_and_billing_child_total ??
                          price * qty ??
                          0
                      ) || 0;

                    const productImage =
                      item.product_image ||
                      item.product?.product_image ||
                      item.quotation_and_billing_product_image ||
                      null;

                    return (
                      <tr
                        key={
                          item.quotation_and_billing_child_id ||
                          item.quotation_child_id ||
                          index
                        }
                      >
                        <td>{index + 1}</td>

                        <td>{productName}</td>

                        <td>
                          {productImage ? (
                            <img
                              src={`${api.IMG_URL}product_images/${productImage}`}
                              alt={productName}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          ) : (
                            "N/A"
                          )}
                        </td>

                        <td>₹ {price.toFixed(2)}</td>

                        <td>
                          <span>{qty}</span>
                        </td>

                        <td>₹ {total.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#405189,secondary:#0ab39c"
                        style={{ width: "72px", height: "72px" }}
                      ></lord-icon>
                      <div className="mt-4">
                        <h5>No items found</h5>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Totals + QR */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            {type !== "Quotation" ? (
              <div className="d-flex flex-column align-items-center">
                <div className="small mb-1">Scan To Pay (UPI)</div>
                <QRCode size={110} value={upiLink} />
                <div className="small mt-1">
                  UPI: {BusinessData?.user_upi_id || "N/A"}
                </div>
              </div>
            ) : (
              <div />
            )}

            <div style={{ minWidth: 320 }}>
              <div className="d-flex justify-content-between">
                <span>Total Amount</span>
                <strong>
                  ₹{" "}
                  {Number(
                    singleQuotationBilling?.quotation_and_billing_master_total || 0
                  ).toFixed(2)}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>GST Amount</span>
                <strong>
                  ₹{" "}
                  {Number(
                    singleQuotationBilling?.quotation_and_billing_master_gst_amount || 0
                  ).toFixed(2)}
                </strong>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2">
                <span className="fw-bold">Grand Total</span>
                <span className="fw-bold">₹ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="success"
            onClick={handleDownloadPdf}
            disabled={!masterId}
          >
            Print / Download PDF
          </Button>

          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default QuotationAndBillingPreviewModal;