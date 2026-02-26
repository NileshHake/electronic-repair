

const sequelize = require("../../../config/db");
const { formatDateTime } = require("../../../web/src/helpers/date_and_time_format");
const User = require("../../auth/user_model");
const { getCreatedBy } = require("../../helper/CurrentUser");
const { generateNumber } = require("../../invoice number/invoice_number_controller");
const Recovery = require("../../recovery/recovery_model");
const Repair = require("../repair_model");
const QuotationAndBillingChild = require("./quotation_and_billing_child_model");
const QuotationAndBillingMaster = require("./quotation_and_billing_master_model");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

// CREATE QuotationAndBill
exports.createQuotationAndBill = async (req, res) => {
    try {
        let {
            quotation_and_billing_master_customer_id,
            recovery_or_repair, // "repair" | "recovery"
            quotation_and_billing_master_repair_id,
            quotation_and_billing_master_total,
            quotation_and_billing_master_gst_amount,
            quotation_and_billing_master_grand_total,
            quotation_or_billing, // "Quotation" | "Billing" (or lowercase)
        } = req.body;

        // ---------------------------
        // ⭐ Convert FormData items[] into array
        // ---------------------------
        const items = [];
        Object.keys(req.body).forEach((key) => {
            const match = key.match(/^items\[(\d+)\]\[(.+)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2];
                if (!items[index]) items[index] = {};
                items[index][field] = req.body[key];
            }
        });

        const t = await sequelize.transaction();

        // ✅ normalize types
        const mode = String(recovery_or_repair || "repair").toLowerCase(); // "repair" | "recovery"
        const docType = String(quotation_or_billing || "Quotation").toLowerCase(); // "quotation" | "billing"

        const quotationNo = await generateNumber({
            businessId: 4,
            type: docType === "quotation" ? "repairquotation" : "repairinvoice",
        });

        // Create Master
        const master = await QuotationAndBillingMaster.create(
            {
                quotation_and_billing_master_invoice_number: quotationNo,
                quotation_and_billing_master_date: new Date(),
                quotation_and_billing_master_customer_id,
                quotation_and_billing_master_repair_id,
                quotation_or_billing, // store as you are sending (Quotation/Billing)
                recovery_or_repair: mode,
                quotation_and_billing_master_total,
                quotation_and_billing_master_gst_amount,
                quotation_and_billing_master_grand_total,
                quotation_and_billing_master_created_by: getCreatedBy(req.currentUser),
            },
            { transaction: t }
        );

        // Child items insert
        const childItems = items.map((item) => ({
            quotation_and_billing_item_name: item.quotation_and_billing_product_name,
            quotation_and_billing_qty: item.quotation_and_billing_qty,
            quotation_and_billing_child_product_id: item.quotation_and_billing_child_product_id,
            quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
            quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
            quotation_and_billing_service_or_product: item.quotation_and_billing_service_or_product,

            // ✅ FIX: MRP + SALE PRICE both should be stored properly (you had duplicate sale_price line)
            quotation_and_billing_product_mrp: item.quotation_and_billing_product_mrp,
            quotation_and_billing_product_sale_price: item.quotation_and_billing_product_sale_price,

            quotation_and_billing_child_total: item.quotation_and_billing_child_total,
            quotation_and_billing_child_master_id: master.quotation_and_billing_master_id,
        }));

        await QuotationAndBillingChild.bulkCreate(childItems, { transaction: t });

        // ============================
        // ✅ Update Repair OR Recovery
        // ============================
        if (mode === "recovery") {
            // ✅ update Recovery table
            const RecoveryJobData = await Recovery.findByPk(quotation_and_billing_master_repair_id);

            if (RecoveryJobData && docType === "quotation") {
                await RecoveryJobData.update(
                    { recovery_quotation_id: master.quotation_and_billing_master_id },
                    { transaction: t }
                );
            } else if (RecoveryJobData && docType === "billing") {
                await RecoveryJobData.update(
                    { recovery_bill_id: master.quotation_and_billing_master_id },
                    { transaction: t }
                );
            } else {
                console.log("Recovery job not found with ID:", quotation_and_billing_master_repair_id);
            }
        } else {
            // ✅ update Repair table (existing behavior)
            const RepairJobData = await Repair.findByPk(quotation_and_billing_master_repair_id);

            if (RepairJobData && docType === "quotation") {
                await RepairJobData.update(
                    { repair_quotation_id: master.quotation_and_billing_master_id },
                    { transaction: t }
                );
            } else if (RepairJobData && docType === "billing") {
                await RepairJobData.update(
                    { repair_bill_id: master.quotation_and_billing_master_id },
                    { transaction: t }
                );
            } else {
                console.log("Repair job not found with ID:", quotation_and_billing_master_repair_id);
            }
        }

        await t.commit();

        return res.status(201).json({
            message: "Quotation & Billing created successfully",
            master,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to create Quotation & Billing",
            details: err.message,
        });
    }
};

module.exports.quotationInvoicePdf = async (req, res) => {
    let doc;
    try {
        const { id } = req.params;

        const quotation = await QuotationAndBillingMaster.findByPk(id);
        if (!quotation) {
            return res.status(404).json({ status: false, message: "Quotation not found" });
        }

        const items = await QuotationAndBillingChild.findAll({
            where: { quotation_and_billing_child_master_id: id },
            order: [["quotation_and_billing_child_id", "ASC"]],
        });

        const [business, customer] = await Promise.all([
            quotation.quotation_and_billing_master_created_by
                ? User.findByPk(quotation.quotation_and_billing_master_created_by)
                : null,
            quotation.quotation_and_billing_master_customer_id
                ? User.findByPk(quotation.quotation_and_billing_master_customer_id)
                : null,
        ]);

        // ✅ IMPORTANT: set status + headers BEFORE piping
        res.status(200);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Quotation-${id}.pdf`);

        // ✅ A4 fixed
        doc = new PDFDocument({
            size: "A4",
            margin: 28,
            bufferPages: true,
        });

        doc.pipe(res);

        // ===== THEME =====
        const theme = {
            text: "#111827",
            muted: "#6b7280",
            line: "#e5e7eb",
            soft: "#f3f4f6",
            softer: "#f9fafb",
            rowAlt: "#fcfcfd",
        };

        // ===== FOOTER SPACE RESERVED =====
        const FOOTER_SPACE = 34; // keep space at bottom always

        // ===== COMPACT CONFIG =====
        const COMPACT = {
            headerReturnY: 78,
            billingCardH: 82,
            tableFont: 8,
            headerH: 20,
            rowH: 18,
        };

        // ===== PAGE METRICS =====
        const PAGE = () => ({
            w: doc.page.width,
            h: doc.page.height,
            left: doc.page.margins.left,
            right: doc.page.width - doc.page.margins.right,
            top: doc.page.margins.top,
            bottom: doc.page.height - doc.page.margins.bottom,
            contentW: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        });

        // ===== HELPERS =====
        const safe = (val) =>
            val !== null && val !== undefined && String(val).trim() ? String(val) : "N/A";

        // NOTE: Helvetica doesn’t render ₹ reliably, so use Rs.
        const moneyINR = (val) => {
            const n = Number(val || 0);
            return `Rs. ${n.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        };

        const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

        const buildAddressLines = (u) => {
            if (!u) return [];
            const line1 = [u.user_address_description, u.user_address_block].filter(Boolean).join(", ");
            const line2 = [u.user_address_city, u.user_address_district, u.user_address_state]
                .filter(Boolean)
                .join(", ");
            const line3 = u.user_address_pincode ? `PIN: ${u.user_address_pincode}` : "";
            return [line1, line2, line3].filter(Boolean);
        };

        const drawHLine = (y) => {
            const { left, right } = PAGE();
            doc.moveTo(left, y).lineTo(right, y).strokeColor(theme.line).lineWidth(1).stroke();
        };

        // ✅ Better page-break function (reserves footer space)
        const ensureSpace = (y, needed) => {
            const { bottom, top } = PAGE();
            if (y + needed > bottom - FOOTER_SPACE) {
                doc.addPage();
                return top;
            }
            return y;
        };

        const fitOneLine = (text, width) => {
            const s = safe(text);
            if (doc.widthOfString(s) <= width) return s;
            let out = s;
            while (out.length > 0 && doc.widthOfString(out + "…") > width) {
                out = out.slice(0, -1);
            }
            return out + "…";
        };

        // ✅ GST split (inclusive)
        const splitInclusiveGST = (gross, gstPercent) => {
            const p = Number(gstPercent || 0);
            if (!p) return { base: round2(gross), gst: 0, gross: round2(gross) };
            const base = gross / (1 + p / 100);
            const gst = gross - base;
            return { base: round2(base), gst: round2(gst), gross: round2(gross) };
        };

        // ===== DYNAMIC MODE =====
        // ✅ FIX: make docType detection case-safe
        const docTypeRaw = String(quotation?.quotation_or_billing || "").toLowerCase().trim();
        const docType = docTypeRaw === "billing" ? "Billing" : "Quotation"; // Billing/Quotation

        const modeRaw = String(quotation?.recovery_or_repair || "").toLowerCase().trim();
        const mode = modeRaw === "recovery" ? "recovery" : "repair"; // recovery/repair

        // ===== HEADER =====
        const drawHeader = () => {
            const { left, right } = PAGE();
            const y0 = PAGE().top;

            const businessName = business?.user_name || "Your Business Name";
            const gstNo = business?.user_gst_id || business?.user_gst || "N/A"; // 👈 adjust field name if different

            doc
                .font("Helvetica-Bold")
                .fontSize(22)
                .fillColor(theme.text)
                .text(businessName, left, y0);

            doc
                .font("Helvetica-Bold")
                .fontSize(18)
                .fillColor(theme.text)
                .text(docType === "Billing" ? "INVOICE" : "QUOTATION", right - 200, y0, {
                    width: 200,
                    align: "right",
                });

            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor(theme.muted)
                .text(`No: ${safe(quotation.quotation_and_billing_master_invoice_number)}`, right - 200, y0 + 22, {
                    width: 200,
                    align: "right",
                })
                .text(`Date: ${safe(formatDateTime(quotation.quotation_and_billing_master_date))}`, right - 200, y0 + 34, {
                    width: 200,
                    align: "right",
                })
                .text(`Mode: ${mode}`, right - 200, y0 + 46, {
                    width: 200,
                    align: "right",
                })
                .text(`GST No: ${safe(gstNo)}`, right - 200, y0 + 58, {   // ✅ ADDED THIS LINE
                    width: 200,
                    align: "right",
                });

            drawHLine(y0 + 74);  // 👈 increase line position because we added one more row

            return y0 + (COMPACT.headerReturnY + 12); // 👈 increase spacing
        };

        // ===== FROM / BILL TO =====
        const drawBilling = (y) => {
            const { left, contentW } = PAGE();
            const colGap = 16;
            const colW = (contentW - colGap) / 2;

            doc.font("Helvetica-Bold").fontSize(9).fillColor(theme.text);
            doc.text("FROM", left, y);
            doc.text("BILL TO", left + colW + colGap, y);

            y += 12;

            const cardH = COMPACT.billingCardH;
            doc.roundedRect(left, y, colW, cardH, 8).fill(theme.softer);
            doc.roundedRect(left + colW + colGap, y, colW, cardH, 8).fill(theme.softer);

            // Business
            const bx = left + 10;
            const by = y + 8;
            doc.font("Helvetica-Bold").fontSize(9).fillColor(theme.text);
            doc.text(safe(business?.user_name), bx, by, { width: colW - 20 });

            doc.font("Helvetica").fontSize(8).fillColor(theme.muted);
            doc.text(safe(business?.user_email), bx, by + 14, { width: colW - 20 });
            doc.text(safe(business?.user_phone_number), bx, by + 26, { width: colW - 20 });

            let ay = by + 40;
            doc.fillColor("#374151");
            buildAddressLines(business)
                .slice(0, 2)
                .forEach((line) => {
                    doc.text(fitOneLine(line, colW - 20), bx, ay, { width: colW - 20 });
                    ay += 12;
                });

            // Customer
            const cx = left + colW + colGap + 10;
            const cy = y + 8;

            doc.font("Helvetica-Bold").fontSize(9).fillColor(theme.text);
            doc.text(safe(customer?.user_name), cx, cy, { width: colW - 20 });

            doc.font("Helvetica").fontSize(8).fillColor(theme.muted);
            doc.text(safe(customer?.user_email), cx, cy + 14, { width: colW - 20 });
            doc.text(safe(customer?.user_phone_number), cx, cy + 26, { width: colW - 20 });

            let ty = cy + 40;
            doc.fillColor("#374151");
            buildAddressLines(customer)
                .slice(0, 2)
                .forEach((line) => {
                    doc.text(fitOneLine(line, colW - 20), cx, ty, { width: colW - 20 });
                    ty += 12;
                });

            return y + cardH + 16;
        };

        // ===== TABLE CONFIG =====
        const table = {
            fontSize: COMPACT.tableFont,
            headerH: COMPACT.headerH,
            rowH: COMPACT.rowH,
            cols: (contentW) => {
                const sr = 24;
                const qty = 34;
                const unit = 66;
                const base = 66;
                const gst = 58;
                const total = 70;
                const name = contentW - (sr + qty + unit + base + gst + total);
                return { sr, name, unit, qty, base, gst, total };
            },
        };

        const drawTableHeader = (y) => {
            const { left, contentW } = PAGE();
            const c = table.cols(contentW);

            doc.rect(left, y, contentW, table.headerH).fill(theme.soft);

            doc.font("Helvetica-Bold").fontSize(8).fillColor(theme.text);

            const x0 = left;
            doc.text("SR", x0 + 4, y + 6, { width: c.sr - 8 });
            doc.text("DESCRIPTION", x0 + c.sr + 4, y + 6, { width: c.name - 8 });
            doc.text("UNIT (INC)", x0 + c.sr + c.name, y + 6, { width: c.unit - 8, align: "right" });
            doc.text("QTY", x0 + c.sr + c.name + c.unit, y + 6, { width: c.qty - 8, align: "right" });
            doc.text("BASE", x0 + c.sr + c.name + c.unit + c.qty, y + 6, { width: c.base - 8, align: "right" });
            doc.text("GST", x0 + c.sr + c.name + c.unit + c.qty + c.base, y + 6, { width: c.gst - 8, align: "right" });
            doc.text("TOTAL", x0 + c.sr + c.name + c.unit + c.qty + c.base + c.gst, y + 6, {
                width: c.total - 8,
                align: "right",
            });

            return y + table.headerH;
        };

        const drawTableRow = (y, idx, it, gstPercent, isAlt) => {
            const { left, contentW } = PAGE();
            const c = table.cols(contentW);
            const x0 = left;

            const descText =
                it?.quotation_and_billing_item_name ||
                it?.quotation_and_billing_product_name ||
                "Item";

            const unitGross = Number(it?.quotation_and_billing_product_sale_price || 0);
            const qty = Number(it?.quotation_and_billing_qty || 1);

            const lineGross = round2(unitGross * qty);
            const split = splitInclusiveGST(lineGross, gstPercent);

            const rowH = table.rowH;

            // ✅ FIX: alternate row background was changing fillColor and hiding text.
            // Use save/restore so text color is not affected.
            if (isAlt) {
                doc.save();
                doc.rect(left, y, contentW, rowH).fill(theme.rowAlt);
                doc.restore();
            }

            doc.font("Helvetica").fontSize(table.fontSize).fillColor("#374151");

            const desc = fitOneLine(descText, c.name - 10);

            doc.text(String(idx + 1), x0 + 4, y + 5, { width: c.sr - 8 });
            doc.text(desc, x0 + c.sr + 4, y + 5, { width: c.name - 8, lineBreak: false });

            doc.text(moneyINR(unitGross), x0 + c.sr + c.name, y + 5, { width: c.unit - 8, align: "right" });
            doc.text(String(qty), x0 + c.sr + c.name + c.unit, y + 5, { width: c.qty - 8, align: "right" });

            doc.text(moneyINR(split.base), x0 + c.sr + c.name + c.unit + c.qty, y + 5, { width: c.base - 8, align: "right" });
            doc.text(moneyINR(split.gst), x0 + c.sr + c.name + c.unit + c.qty + c.base, y + 5, { width: c.gst - 8, align: "right" });
            doc.text(moneyINR(split.gross), x0 + c.sr + c.name + c.unit + c.qty + c.base + c.gst, y + 5, {
                width: c.total - 8,
                align: "right",
            });

            doc
                .moveTo(left, y + rowH)
                .lineTo(left + contentW, y + rowH)
                .strokeColor(theme.line)
                .lineWidth(1)
                .stroke();

            return { y: y + rowH, base: split.base, gst: split.gst, gross: split.gross };
        };

        // ===== TOTALS =====
        const drawTotals = (y, totals) => {
            const { right } = PAGE();

            const boxW = 240;
            const x = right - boxW;

            doc.font("Helvetica").fontSize(9).fillColor(theme.muted);
            doc.text("Subtotal (Base)", x, y, { width: 130, align: "left" });
            doc.fillColor(theme.text).text(moneyINR(totals.baseTotal), x, y, { width: boxW, align: "right" });

            y += 14;
            doc.fillColor(theme.muted).text(`GST (${totals.gstPercent}%)`, x, y, { width: 130, align: "left" });
            doc.fillColor(theme.text).text(moneyINR(totals.gstTotal), x, y, { width: boxW, align: "right" });

            y += 18;
            doc.roundedRect(x - 8, y - 6, boxW + 16, 26, 10).fill(theme.softer);
            doc.font("Helvetica-Bold").fontSize(11).fillColor(theme.text);
            doc.text("Grand Total", x, y, { width: 130, align: "left" });
            doc.text(moneyINR(totals.grandTotal), x, y, { width: boxW, align: "right" });

            return y + 30;
        };

        // ===== QR + UPI (FOR BOTH: Billing full, Quotation half) =====
        const drawUpi = async (y, payAmount, grandTotal) => {
            const { left, right } = PAGE();

            const upiId = business?.user_upi_id || business?.user_upi || "prashantdhaigude530@okaxis";
            const payeeName = business?.user_name || "Business";
            const note = `Doc ${safe(quotation.quotation_and_billing_master_invoice_number)}`;
            const txnRef = `QT-${id}`;

            const params = new URLSearchParams();
            params.set("pa", upiId);
            params.set("pn", payeeName);
            params.set("am", Number(payAmount || 0).toFixed(2));
            params.set("cu", "INR");
            params.set("tn", note);
            params.set("tr", txnRef);

            const upiUri = `upi://pay?${params.toString()}`;

            doc.font("Helvetica-Bold").fontSize(10).fillColor(theme.text).text("Pay via UPI", left, y);
            y += 12;

            doc.font("Helvetica").fontSize(8).fillColor("#374151");
            doc.text(`UPI: ${upiId}`, left, y);

            // ✅ Show label based on docType
            const label = docType === "Billing" ? "Pay Amount (Full)" : "Pay Amount (Advance 50%)";
            doc.text(`${label}: ${moneyINR(payAmount)}`, left, y + 12);
            doc.text(`Total: ${moneyINR(grandTotal)}`, left, y + 24);

            try {
                const qrBuffer = await QRCode.toBuffer(upiUri, {
                    type: "png",
                    errorCorrectionLevel: "M",
                    margin: 1,
                    scale: 6,
                });

                const qrSize = 110;
                const qrX = right - qrSize;
                const qrY = y - 8;

                doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10).fill(theme.softer);
                doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

                doc.font("Helvetica").fontSize(7).fillColor(theme.muted);
                doc.text("Scan & Pay", qrX - 10, qrY + qrSize + 6, {
                    width: qrSize + 20,
                    align: "center",
                });
            } catch (e) {
                doc.font("Helvetica").fontSize(7).fillColor("#ef4444");
                doc.text("QR failed. UPI link:", left, y + 40);
                doc.fillColor("#111827");
                doc.text(upiUri, left, y + 52, { width: PAGE().contentW });
            }

            return y + 70;
        };

        // ===== TERMS (DYNAMIC) =====
        const getTerms = () => {
            const common = [
                "Prices are subject to change if additional parts/services are required.",
                "Any additional work not mentioned in this document will be charged separately.",
                "Goods once sold will not be returned or exchanged (unless defect confirmed).",
            ];

            const quotationTerms = [
                "This quotation is valid for 7 days from the date of issue.",
                "50% advance required to confirm the order.",
                "Delivery timeline will be shared after confirmation.",
            ];

            const billingTerms = [
                "Invoice payment due immediately (unless credit terms agreed).",
                "Warranty (if applicable) as per manufacturer/service policy.",
                "Payment once done is non-refundable for completed services.",
            ];

            const repairTerms = [
                "Repair estimate may vary after device inspection.",
                "If device has liquid/physical damage, extra charges may apply.",
            ];

            const recoveryTerms = [
                "Data recovery success depends on device condition; no guarantee of 100% recovery.",
                "Recovered data will be shared as per customer confirmation.",
            ];

            const byDocType = docType === "Billing" ? billingTerms : quotationTerms;
            const byMode = mode === "recovery" ? recoveryTerms : repairTerms;

            return [...byDocType, ...byMode, ...common];
        };

        const drawTerms = (y) => {
            const terms = getTerms();

            y = ensureSpace(y, 140);

            doc.font("Helvetica-Bold").fontSize(11).fillColor(theme.text);
            doc.text("Terms & Conditions", PAGE().left, y);
            y += 18;

            doc.font("Helvetica").fontSize(9).fillColor("#374151");

            for (const term of terms) {
                const h = doc.heightOfString(`• ${term}`, { width: PAGE().contentW - 10 });
                y = ensureSpace(y, h + 10);
                doc.text(`• ${term}`, PAGE().left + 10, y, { width: PAGE().contentW - 10 });
                y += h + 8;
            }

            return y;
        };

        // ===== FOOTER =====
        const addFooters = () => {
            const range = doc.bufferedPageRange();
            const totalPages = range.count;

            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                const { left, right, bottom, contentW } = PAGE();

                doc
                    .moveTo(left, bottom - 22)
                    .lineTo(right, bottom - 22)
                    .strokeColor(theme.line)
                    .lineWidth(1)
                    .stroke();

                doc.font("Helvetica").fontSize(7).fillColor(theme.muted);
                doc.text("Thank you for your business!", left, bottom - 16, { width: contentW, align: "left" });
                doc.text(`Page ${i + 1} of ${totalPages}`, left, bottom - 16, { width: contentW, align: "right" });
            }
        };

        // =========================
        // RENDER (A4 MULTI PAGE)
        // =========================
        let y = drawHeader();
        y = drawBilling(y);

        y = ensureSpace(y, 30);
        y = drawTableHeader(y);

        const gstPercent = 18;

        let sumBase = 0;
        let sumGst = 0;
        let sumGross = 0;

        for (let i = 0; i < items.length; i++) {
            // ✅ ensure row space, if new page, redraw header row
            y = ensureSpace(y, table.rowH + 8);
            if (y === PAGE().top) {
                y = drawHeader();       // ✅ repeat main header on each page
                y = y + 4;
                y = drawTableHeader(y); // ✅ repeat table header
            }

            const r = drawTableRow(y, i, items[i], gstPercent, i % 2 === 1);
            y = r.y;
            sumBase += r.base;
            sumGst += r.gst;
            sumGross += r.gross;
        }

        // Totals: use DB first else computed
        let baseTotal = Number(quotation.quotation_and_billing_master_total || 0);
        let gstTotal = Number(quotation.quotation_and_billing_master_gst_amount || 0);
        let grandTotal = Number(quotation.quotation_and_billing_master_grand_total || 0);

        if (!baseTotal && !gstTotal && !grandTotal) {
            baseTotal = sumBase;
            gstTotal = sumGst;
            grandTotal = sumGross;
        } else if (!grandTotal) {
            grandTotal = Number(baseTotal) + Number(gstTotal);
        }

        baseTotal = round2(baseTotal);
        gstTotal = round2(gstTotal);
        grandTotal = round2(grandTotal);

        y += 10;
        y = ensureSpace(y, 130);
        y = drawTotals(y, { baseTotal, gstTotal, grandTotal, gstPercent });

        // ✅ FIX: QR should show ALWAYS
        // Billing => full grand total, Quotation => 50%
        const payAmount = docType === "Billing" ? grandTotal : round2(grandTotal * 0.5);

        y = ensureSpace(y, 90);
        y += 8;
        y = await drawUpi(y, payAmount, grandTotal);

        y = ensureSpace(y, 140);
        y += 8;
        y = drawTerms(y);

        addFooters();

        doc.end();
    } catch (err) {
        console.error("PDF generation failed:", err);

        // ✅ IMPORTANT: if streaming started, don't send JSON (corrupts PDF)
        try {
            if (!res.headersSent) {
                return res.status(500).json({ status: false, message: "Internal Server Error" });
            }
            res.end();
        } catch (e) {
            // ignore
        }
    }
};
// GET All QuotationAndBill
exports.getQuotationAndBills = async (req, res) => {
    try {
        // Step 1: Fetch all masters with customer info
        const masters = await sequelize.query(
            `
    SELECT 
      m.*,
      u.user_name AS customer_name,
      u.user_email AS customer_email
    FROM tbl_quotation_and_billing_masters AS m
    LEFT JOIN tbl_users AS u 
        ON m.quotation_and_billing_master_customer_id = u.user_id
    WHERE m.quotation_and_billing_master_created_by = :createdBy
    ORDER BY m.quotation_and_billing_master_id ASC
  `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { createdBy: getCreatedBy(req.currentUser) },
            }
        );

        // Step 2: If no masters, return empty array
        if (!masters.length) {
            return res.json([]);
        }

        // Step 3: Fetch only children for the fetched masters
        const masterIds = masters.map((m) => m.quotation_and_billing_master_id);

        const children = await sequelize.query(
            `
      SELECT *
      FROM tbl_quotation_and_billing_children
      WHERE quotation_and_billing_child_master_id IN (:masterIds)
      `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { masterIds },
            }
        );

        // Step 4: Map children into their respective masters
        const result = masters.map((master) => {
            const masterChildren = children.filter(
                (c) => c.quotation_and_billing_child_master_id === master.quotation_and_billing_master_id
            );
            return {
                ...master,
                items: masterChildren, // Nested array
            };
        });

        // Step 5: Return the final result
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBills" });
    }
};




// GET Single QuotationAndBill
exports.getQuotationAndBill = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Fetch ONE master with customer info
        const masters = await sequelize.query(
            `
            SELECT 
                m.*,
                u.user_name AS customer_name,
                u.user_email AS customer_email
            FROM tbl_quotation_and_billing_masters AS m
            LEFT JOIN tbl_users AS u 
                ON m.quotation_and_billing_master_customer_id = u.user_id
            WHERE m.quotation_and_billing_master_id = :id
            `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { id },
            }
        );

        // Step 2: If no master exists
        if (!masters.length) {
            return res.status(404).json({ error: "Quotation & Billing not found" });
        }

        const master = masters[0];

        // Step 3: Fetch children of this master
        const children = await sequelize.query(
            `
            SELECT *
            FROM tbl_quotation_and_billing_children
            WHERE quotation_and_billing_child_master_id = :id
            `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { id },
            }
        );

        // Step 4: Add children as items array
        const finalData = {
            ...master,
            items: children,
        };

        res.json(finalData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch QuotationAndBill" });
    }
};


// UPDATE QuotationAndBill (delete old children and add new)
exports.updateQuotationAndBill = async (req, res) => {


    // Use the exact field names from your model
    const {
        quotation_and_billing_master_invoice_number,
        quotation_and_billing_master_date,
        quotation_and_billing_master_customer_id,
        quotation_and_billing_master_repair_id,
        quotation_and_billing_master_total,
        quotation_and_billing_master_gst_amount,
        quotation_and_billing_master_grand_total,
        quotation_and_billing_master_created_by,
        items, // array of child items
    } = req.body;

    const t = await sequelize.transaction();
    try {

        const master = await QuotationAndBillingMaster.findByPk(req.body.quotation_and_billing_master_id);
        if (!master) return res.status(404).json({ error: "QuotationAndBill not found" });

        // Update master using model field names directly
        await master.update(
            {
                quotation_and_billing_master_invoice_number,
                quotation_and_billing_master_date,
                quotation_and_billing_master_customer_id,
                quotation_and_billing_master_repair_id,
                quotation_and_billing_master_total,
                quotation_and_billing_master_gst_amount,
                quotation_and_billing_master_grand_total,
                quotation_and_billing_master_created_by,
            },
            { transaction: t }
        );
        // Convert form-data "items[0][field]" keys into an array
        const parsedItems = [];
        Object.keys(req.body).forEach((key) => {
            const match = key.match(/^items\[(\d+)\]\[(.+)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2];

                if (!parsedItems[index]) parsedItems[index] = {};
                parsedItems[index][field] = req.body[key];
            }
        });


        // Delete old child items
        await QuotationAndBillingChild.destroy({
            where: { quotation_and_billing_child_master_id: master.quotation_and_billing_master_id },
            transaction: t,
        });

        // Add new child items using exact model field names
        const childItems = parsedItems.map((item) => ({
            quotation_and_billing_item_name: item.quotation_and_billing_product_name,
            quotation_and_billing_qty: item.quotation_and_billing_qty,
            quotation_and_billing_child_product_id: item.quotation_and_billing_child_product_id,
            quotation_and_billing_tax_percentage: item.quotation_and_billing_tax_percentage,
            quotation_and_billing_tax_value: item.quotation_and_billing_tax_value,
            quotation_and_billing_service_or_product: item.quotation_and_billing_service_or_product,
            quotation_and_billing_product_sale_price: item.quotation_and_billing_product_sale_price,
            quotation_and_billing_child_total: item.quotation_and_billing_child_total,
            quotation_and_billing_child_master_id: master.quotation_and_billing_master_id,
        }));

        await QuotationAndBillingChild.bulkCreate(childItems, { transaction: t });
        await t.commit();
        res.json({ message: "QuotationAndBill updated successfully" });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to update QuotationAndBill" });
    }
};


// DELETE QuotationAndBill
exports.deleteQuotationAndBill = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        await QuotationAndBillingChild.destroy({ where: { quotation_and_billing_child_master_id: id }, transaction: t });
        await QuotationAndBillingMaster.destroy({ where: { quotation_and_billing_master_id: id }, transaction: t });
        await t.commit();
        res.json({ message: "QuotationAndBill deleted successfully" });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: "Failed to delete QuotationAndBill" });
    }
};
