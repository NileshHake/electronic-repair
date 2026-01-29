import React, { useRef, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { api } from "config";
import { formatDateTime } from "@/helpers/date_and_time";

const safeFirstImage = (product_image) => {
  try {
    if (!product_image) return "";
    const parsed = typeof product_image === "string" ? JSON.parse(product_image) : product_image;
    return Array.isArray(parsed) && parsed[0] ? parsed[0] : "";
  } catch {
    return "";
  }
};

const money = (v) => `₹ ${Number(v || 0).toFixed(2)}`;

const InvoicePreviewModal = ({ isOpen, toggle, order, items = [] }) => {
  const printRef = useRef(null);
  const invoiceNo = useMemo(() => `INV-${order?.order_master_id || ""}`, [order?.order_master_id]);

  const downloadPdf = async () => {
    const el = printRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${invoiceNo}.pdf`);
  };

  if (!order) return null;

  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .modal, .modal-content { position: static !important; }
          .modal-footer, .modal-header, button { display: none !important; }
        }
      `}</style>

      <Modal isOpen={isOpen} toggle={toggle} centered style={{ maxWidth: "230mm", width: "230mm" }}>
        <ModalHeader toggle={toggle}>Invoice</ModalHeader>

        <ModalBody style={{ background: "#f7f7fb" }}>
          {/* ✅ Invoice Paper */}
          <div
            ref={printRef}
            className="print-area"
            style={{
              width: "210mm",
              margin: "0 auto",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e9ecef",
              boxShadow: "0 10px 30px rgba(16,24,40,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #eef0f5",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.4 }}>INVOICE</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#475467", lineHeight: 1.5 }}>
                  <div>
                    <span style={{ color: "#101828", fontWeight: 700 }}>Invoice No:</span> {invoiceNo}
                  </div>
                  <div>
                    <span style={{ color: "#101828", fontWeight: 700 }}>Invoice Date:</span>{" "}
                    {order?.order_master_date ? formatDateTime(order.order_master_date) : "-"}
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div
                style={{
                  minWidth: 320,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #eef0f5",
                  background: "#ffffff",
                }}
              >
                <div style={{ fontSize: 11, color: "#667085", fontWeight: 700, marginBottom: 6 }}>
                  BILL TO
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#101828" }}>
                  {order?.order_master_customer_name || order?.user_name || "-"}
                </div>
                <div style={{ fontSize: 12, color: "#475467", marginTop: 4, lineHeight: 1.4 }}>
                  <div>{order?.customer_address_description || "-"}</div>
                  <div>
                    <b style={{ color: "#101828" }}>Pin:</b> {order?.customer_address_pincode || "-"} &nbsp; | &nbsp;
                    <b style={{ color: "#101828" }}>Phone:</b> {order?.order_master_delivery_phone_number || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#101828" }}>Items</div>
                <div style={{ fontSize: 12, color: "#667085" }}>
                  Total Items: <b style={{ color: "#101828" }}>{items?.length || 0}</b>
                </div>
              </div>

              {/* Table */}
              <div style={{ border: "1px solid #eef0f5", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {[
                        { h: "#", w: 40, align: "left" },
                        { h: "Product", w: 260, align: "left" },
                        { h: "Image", w: 70, align: "left" },
                        { h: "Price", w: 90, align: "right" },
                        { h: "Qty", w: 60, align: "right" },
                        { h: "GST", w: 90, align: "right" },
                        { h: "Discount", w: 90, align: "right" },
                        { h: "Total", w: 110, align: "right" },
                      ].map((col) => (
                        <th
                          key={col.h}
                          style={{
                            padding: "10px 10px",
                            textAlign: col.align,
                            fontWeight: 800,
                            color: "#344054",
                            borderBottom: "1px solid #eef0f5",
                            width: col.w,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col.h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {items?.length ? (
                      items.map((it, idx) => {
                        const img = safeFirstImage(it.product_image);
                        const rowBg = idx % 2 === 0 ? "#ffffff" : "#fcfcff";

                        return (
                          <tr key={it.order_child_id || idx} style={{ background: rowBg }}>
                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7" }}>
                              {idx + 1}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7" }}>
                              <div style={{ fontWeight: 700, color: "#101828" }}>
                                {it.product_name || "-"}
                              </div>
                              <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>
                                GST%: {Number(it.order_child_gst_percentage || 0).toFixed(2)}%
                              </div>
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7" }}>
                              {img ? (
                                <img
                                  src={`${api.IMG_URL}product_images/${img}`}
                                  alt="product"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    objectFit: "cover",
                                    borderRadius: 10,
                                    border: "1px solid #eef0f5",
                                  }}
                                />
                              ) : (
                                <span style={{ color: "#98A2B3" }}>N/A</span>
                              )}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7", textAlign: "right" }}>
                              {money(it.order_child_product_price)}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7", textAlign: "right" }}>
                              {Number(it.order_child_product_qty || 0)}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7", textAlign: "right" }}>
                              {money(it.order_child_gst_amount)}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7", textAlign: "right" }}>
                              {money(it.order_child_discount)}
                            </td>

                            <td style={{ padding: "10px 10px", borderBottom: "1px solid #f2f4f7", textAlign: "right", fontWeight: 800 }}>
                              {money(it.order_child_grand_total)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: 14, textAlign: "center", color: "#667085" }}>
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <div
                  style={{
                    width: 330,
                    border: "1px solid #eef0f5",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fbfbff",
                  }}
                >
                  <RowLine label="Sub Total" value={money(order?.order_master_sub_total)} />
                  <RowLine label={`GST (${Number(order?.order_master_gst_percentage || 0).toFixed(2)}%)`} value={money(order?.order_master_gst_amount)} />
                  <RowLine label="Delivery" value={money(order?.order_master_delivery_charge)} />

                  <div style={{ borderTop: "1px dashed #d0d5dd", margin: "10px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#101828" }}>Grand Total</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#101828" }}>
                      {money(order?.order_master_grand_total)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: "#667085" }}>
                Thanks for your order! If you have any questions, please contact support.
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="success" onClick={downloadPdf}>
            Download PDF
          </Button>
          <Button color="danger" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

// helper component
const RowLine = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
    <span style={{ color: "#475467" }}>{label}</span>
    <span style={{ fontWeight: 800, color: "#101828" }}>{value}</span>
  </div>
);

export default InvoicePreviewModal;
