const sequelize = require("../../config/db");
const QuotationMaster = require("./quotation_master_model");
const QuotationItem = require("./quotation_master_child");
const User = require("../auth/user_model");
const { Op } = require("sequelize");
const PDFDocument = require("pdfkit");
const { generateNumber } = require("../invoice number/invoice_number_controller");
const QRCode = require("qrcode");
/* 🟢 CREATE QUOTATION (MASTER + CHILD) */
const store = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { quotation_items, ...masterData } = req.body;

    const businessId = Number(masterData.business_id || 4); // ✅ keep 4 as default
    const gst_percentage = Number(masterData.gst_percentage || 18);

    // ✅ validate items
    const itemsArr = Array.isArray(quotation_items) ? quotation_items : [];

    // ✅ generate quotation number
    const quotationNo = await generateNumber({
      businessId,
      type: "quotation",
    });

    // ✅ grand total includes GST
    const grandTotal = Number(masterData.grand_total || 0);
    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      await t.rollback();
      return res.status(400).json({
        status: false,
        message: "grand_total is required and must be a valid number",
      });
    }

    // ✅ reverse GST from grand total
    const baseTotalRaw = grandTotal / (1 + gst_percentage / 100);
    const gstTotalRaw = grandTotal - baseTotalRaw;

    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

    const base_total = round2(baseTotalRaw);
    const gst_total = round2(gstTotalRaw);
    const grand_total = round2(grandTotal);

    // ✅ create master
    const master = await QuotationMaster.create(
      {
        ...masterData,
        quotation_no: quotationNo,
        business_id: businessId,

        gst_percentage,
        base_total,
        gst_total,
        grand_total,

        created_by: req.currentUser?.user_id,
        customer_id: req.currentUser?.user_id,

        total_items: itemsArr.length,
      },
      { transaction: t }
    );

    // ✅ create children
    if (itemsArr.length > 0) {
      const childData = itemsArr.map((item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 1);
        const total = price * qty;

        return {
          ...item,
          quotation_id: master.quotation_id,
          price,
          qty,
          total: round2(total),
        };
      });

      await QuotationItem.bulkCreate(childData, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      status: true,
      message: "Quotation created successfully",
      data: master,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Error creating quotation",
      error: error.message,
    });
  }
};

/* 🧾 PDF INVOICE */

const quotationInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await QuotationMaster.findByPk(id);
    if (!quotation) {
      return res.status(404).json({ status: false, message: "Quotation not found" });
    }

    const items = await QuotationItem.findAll({
      where: { quotation_id: id },
      order: [["quotation_item_id", "ASC"]],
    });

    const [business, customer] = await Promise.all([
      quotation.business_id ? User.findByPk(quotation.business_id) : null,
      quotation.customer_id ? User.findByPk(quotation.customer_id) : null,
    ]);

    // ✅ PDF headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Quotation-${id}.pdf`);

    // ✅ Doc setup (compact margins + buffered pages)
    const doc = new PDFDocument({
      size: "A4",
      margin: 28, // ✅ compact margin to fit more content
      bufferPages: true, // ✅ required for page numbers
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
      accent: "#111827",
    };

    // ===== COMPACT CONFIG (tuned for 1 page) =====
    const COMPACT = {
      headerReturnY: 78, // header height
      billingCardH: 82, // billing cards height
      tableFont: 8,
      headerH: 20,
      rowH: 18, // fixed single-line row height
      rowPadV: 4,
      termsFont: 7,
      footerGap: 34, // reserved area above footer line
      reserveBottom: 210, // space needed for totals + qr + compact terms + footer
      maxRowsOnePage: 15, // desired minimum on first page
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

    // NOTE: Helvetica doesn't reliably render ₹, so we use "Rs."
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

    const buildUpiUri = ({ pa, pn, am, tn, tr }) => {
      const params = new URLSearchParams();
      params.set("pa", pa);
      params.set("pn", pn || "Pay");
      params.set("am", Number(am || 0).toFixed(2));
      params.set("cu", "INR");
      if (tn) params.set("tn", tn);
      if (tr) params.set("tr", tr);
      return `upi://pay?${params.toString()}`;
    };

    const drawHLine = (y) => {
      const { left, right } = PAGE();
      doc.moveTo(left, y).lineTo(right, y).strokeColor(theme.line).lineWidth(1).stroke();
    };

    const ensureSpace = (y, needed) => {
      const { bottom } = PAGE();
      if (y + needed > bottom) {
        doc.addPage();
        return doc.y || PAGE().top;
      }
      return y;
    };

    // Truncate to one line for description
    const fitOneLine = (text, width) => {
      const s = safe(text);
      if (doc.widthOfString(s) <= width) return s;
      let out = s;
      while (out.length > 0 && doc.widthOfString(out + "…") > width) {
        out = out.slice(0, -1);
      }
      return out + "…";
    };

    // ===== HEADER BLOCK (Business BIG + quotation right) =====
    const drawHeader = () => {
      const { left, right } = PAGE();
      const y0 = PAGE().top;

      const businessName = business?.user_name || "Your Business Name";

      // LEFT: Business name
      doc.font("Helvetica-Bold").fontSize(22).fillColor(theme.text).text(businessName, left, y0);


      // RIGHT: Quotation title + meta
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(theme.text)
        .text("QUOTATION", right - 200, y0, { width: 200, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(theme.muted)
        .text(`No: ${safe(quotation.quotation_no)}`, right - 200, y0 + 22, {
          width: 200,
          align: "right",
        })
        .text(`Date: ${safe(quotation.create_date)}`, right - 200, y0 + 34, {
          width: 200,
          align: "right",
        })
        .text(`Expires: ${safe(quotation.expire_date)}`, right - 200, y0 + 46, {
          width: 200,
          align: "right",
        });

      drawHLine(y0 + 62);

      return y0 + COMPACT.headerReturnY;
    };

    // ===== FROM / BILL TO (compact) =====
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
      buildAddressLines(business).slice(0, 2).forEach((line) => {
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
      buildAddressLines(customer).slice(0, 2).forEach((line) => {
        doc.text(fitOneLine(line, colW - 20), cx, ty, { width: colW - 20 });
        ty += 12;
      });

      return y + cardH + 16;
    };

    // ===== TABLE CONFIG (compact) =====
    const table = {
      rowPadV: COMPACT.rowPadV,
      fontSize: COMPACT.tableFont,
      headerH: COMPACT.headerH,
      cols: (contentW) => {
        const sr = 26;
        const price = 80;
        const qty = 40;
        const amt = 84;
        const name = contentW - (sr + price + qty + amt);
        return { sr, name, price, qty, amt };
      },
    };

    const drawTableHeader = (y) => {
      const { left, contentW } = PAGE();
      const c = table.cols(contentW);

      doc.rect(left, y, contentW, table.headerH).fill(theme.soft);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(theme.text);

      const x0 = left;
      doc.text("SR", x0 + 5, y + 6, { width: c.sr - 10 });
      doc.text("DESCRIPTION", x0 + c.sr + 5, y + 6, { width: c.name - 10 });

      doc.text("UNIT", x0 + c.sr + c.name, y + 6, { width: c.price - 10, align: "right" });
      doc.text("QTY", x0 + c.sr + c.name + c.price, y + 6, { width: c.qty - 10, align: "right" });
      doc.text("AMOUNT", x0 + c.sr + c.name + c.price + c.qty, y + 6, {
        width: c.amt - 10,
        align: "right",
      });

      return y + table.headerH;
    };

    const drawTableRow = (y, idx, it, isAlt) => {
      const { left, contentW } = PAGE();
      const c = table.cols(contentW);
      const x0 = left;

      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      const total = Number(it.total || price * qty);

      doc.font("Helvetica").fontSize(table.fontSize).fillColor("#374151");

      const rowH = COMPACT.rowH;

      if (isAlt) {
        doc.rect(left, y, contentW, rowH).fill(theme.rowAlt);
      }

      const desc = fitOneLine(it.product_name, c.name - 12);

      doc.fillColor("#374151");
      doc.text(String(idx + 1), x0 + 5, y + 5, { width: c.sr - 10 });

      doc.text(desc, x0 + c.sr + 5, y + 5, { width: c.name - 10, lineBreak: false });

      doc.text(moneyINR(price), x0 + c.sr + c.name, y + 5, { width: c.price - 10, align: "right" });
      doc.text(String(qty), x0 + c.sr + c.name + c.price, y + 5, { width: c.qty - 10, align: "right" });
      doc.text(moneyINR(total), x0 + c.sr + c.name + c.price + c.qty, y + 5, {
        width: c.amt - 10,
        align: "right",
      });

      doc
        .moveTo(left, y + rowH)
        .lineTo(left + contentW, y + rowH)
        .strokeColor(theme.line)
        .lineWidth(1)
        .stroke();

      return y + rowH;
    };

    // ===== TOTALS SECTION (compact) =====
    const drawTotals = (y) => {
      const { right } = PAGE();

      const gstPercent = Number(quotation.gst_percentage || 18);

      let baseTotal = Number(quotation.base_total || 0);
      let gstTotal = Number(quotation.gst_total || 0);
      let grandTotal = Number(quotation.grand_total || 0);

      if ((!baseTotal || !gstTotal) && grandTotal) {
        const base = grandTotal / (1 + gstPercent / 100);
        baseTotal = base;
        gstTotal = grandTotal - base;
      }

      baseTotal = round2(baseTotal);
      gstTotal = round2(gstTotal);
      grandTotal = round2(grandTotal || baseTotal + gstTotal);

      const boxW = 220;
      const x = right - boxW;

      doc.font("Helvetica").fontSize(9).fillColor(theme.muted);
      doc.text("Subtotal", x, y, { width: 120, align: "left" });
      doc.fillColor(theme.text).text(moneyINR(baseTotal), x, y, { width: boxW, align: "right" });

      y += 14;
      doc.fillColor(theme.muted).text(`GST (${gstPercent}%)`, x, y, { width: 120, align: "left" });
      doc.fillColor(theme.text).text(moneyINR(gstTotal), x, y, { width: boxW, align: "right" });

      y += 18;
      doc.roundedRect(x - 8, y - 6, boxW + 16, 26, 10).fill(theme.softer);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(theme.text);
      doc.text("Grand Total", x, y, { width: 120, align: "left" });
      doc.text(moneyINR(grandTotal), x, y, { width: boxW, align: "right" });

      return { y: y + 30, gstPercent, baseTotal, gstTotal, grandTotal };
    };

    // ===== UPI SECTION (compact) =====
    const drawUpi = async (y, grandTotal) => {
      const { left, right } = PAGE();

      const upiId = "prashantdhaigude530@okaxis";
      const payeeName = business?.user_name || "Business";
      const note = `Quotation ${safe(quotation.quotation_no)}`;
      const txnRef = `QT-${id}`;
      const advanceAmount = Number((grandTotal * 0.5).toFixed(2));

      const upiUri = buildUpiUri({
        pa: upiId,
        pn: payeeName,
        am: advanceAmount,
        tn: note,
        tr: txnRef,
      });

      doc.font("Helvetica-Bold").fontSize(10).fillColor(theme.text).text("Pay via UPI", left, y);
      y += 12;

      doc.font("Helvetica").fontSize(8).fillColor("#374151");
      doc.text(`UPI: ${upiId}`, left, y);
      doc.text(`Advance 50%: ${moneyINR(advanceAmount)}`, left, y + 12);
      doc.text(`Total: ${moneyINR(grandTotal)}`, left, y + 24);
      doc.text(`Note: ${fitOneLine(note, 260)}`, left, y + 36, { width: 280 });

      const qrBuffer = await QRCode.toBuffer(upiUri, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 5,
      });

      const qrSize = 95;
      const qrX = right - qrSize;
      const qrY = y - 8;

      doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10).fill(theme.softer);
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      doc.font("Helvetica").fontSize(7).fillColor(theme.muted);
      doc.text("Scan & Pay", qrX - 10, qrY + qrSize + 6, { width: qrSize + 20, align: "center" });

      return y + 62; // compact return
    };

    // ===== TERMS (compact 2 columns) =====
    const drawTerms = (y) => {
      const terms = [
        "Wire charges will be calculated based on actual usage (Indoor: ₹50 per meter, Outdoor: ₹70 per meter).",
        "This quotation is valid until the expiry date mentioned above.",
        "All prices are exclusive of applicable taxes unless otherwise specified.",
        "A 50% advance payment is required to confirm the order.",
        "The delivery timeline will be communicated after order confirmation.",
        "Goods once sold will not be accepted for return or exchange.",
        "Warranty, if applicable, will be provided as per the manufacturer’s terms.",
        "Any additional work or materials not mentioned in this quotation will be charged separately."
      ];


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
    // ===== FOOTER (page numbers + message) =====
    const addFooters = () => {
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        const { left, right, bottom, contentW } = PAGE();

        doc.moveTo(left, bottom - 22).lineTo(right, bottom - 22).strokeColor(theme.line).lineWidth(1).stroke();

        doc.font("Helvetica").fontSize(7).fillColor(theme.muted);
        doc.text("Thank you for your business!", left, bottom - 16, { width: contentW, align: "left" });

        doc.text(`Page ${i + 1} of ${totalPages}`, left, bottom - 16, { width: contentW, align: "right" });
      }
    };

    // =========================
    // RENDER (ONE-PAGE PRIORITY)
    // =========================
    let y = drawHeader();
    y = drawBilling(y);

    y = ensureSpace(y, 30);
    y = drawTableHeader(y);

    // Calculate how many rows can fit on first page while reserving bottom for totals+qr+terms+footer
    const { bottom } = PAGE();
    const tableLimitY = bottom - COMPACT.reserveBottom;
    const rowsFit = Math.min(
      COMPACT.maxRowsOnePage,
      Math.max(0, Math.floor((tableLimitY - y) / COMPACT.rowH))
    );

    const visibleItems = items.slice(0, rowsFit);
    const remainingCount = items.length - visibleItems.length;

    for (let i = 0; i < visibleItems.length; i++) {
      y = drawTableRow(y, i, visibleItems[i], i % 2 === 1);
    }

    if (remainingCount > 0) {
      y += 6;
      doc.font("Helvetica").fontSize(8).fillColor(theme.muted);
      doc.text(
        `+ ${remainingCount} more item(s) not shown (one-page mode shows first ${visibleItems.length}).`,
        PAGE().left,
        y,
        { width: PAGE().contentW }
      );
      y += 10;
    }

    // Totals
    y += 6;
    const totals = drawTotals(y);
    y = totals.y;

    // UPI
    y += 6;
    y = await drawUpi(y, totals.grandTotal);

    // Terms
    y += 6;
    y = drawTerms(y);

    addFooters();

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
/* 🟡 READ ALL QUOTATIONS (JOIN + PAGINATION) */
const index = async (req, res) => {
  try {
    let { page = 1, limit = 10, quotation_status } = req.body;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    let whereSql = "WHERE 1=1";
    const replacements = {};

    if (quotation_status !== undefined && quotation_status !== null && quotation_status !== "") {
      whereSql += " AND qm.quotation_status = :quotation_status";
      replacements.quotation_status = quotation_status;
    }

    const list = await sequelize.query(
      `
      SELECT 
        qm.*,
        cu.user_name AS customer_name,
        cu.user_email AS customer_email,
        cu.user_phone_number AS customer_phone
      FROM tbl_quotation_master AS qm
      LEFT JOIN tbl_users AS cu
        ON qm.customer_id = cu.user_id
      ${whereSql}
      ORDER BY qm.quotation_id DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* 🟣 READ CHILD ITEMS (JOIN PRODUCT + CATEGORY) */
const indexchild = async (req, res) => {
  try {
    const { quotation_id } = req.body;

    if (!quotation_id) {
      return res.status(400).json({ message: "quotation_id is required" });
    }

    const items = await sequelize.query(
      `
      SELECT 
        qi.*,
        p.product_name AS db_product_name,
        p.product_sale_price,
        p.product_mrp,
        c.category_name
      FROM tbl_quotation_items AS qi
      LEFT JOIN tbl_products AS p
        ON qi.product_id = p.product_id
      LEFT JOIN tbl_categories AS c
        ON qi.category_id = c.category_id
      WHERE qi.quotation_id = :quotation_id
      ORDER BY qi.quotation_item_id ASC
      `,
      {
        replacements: { quotation_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};

/* 🔵 READ SINGLE QUOTATION (MASTER + CHILD IN ONE CALL) */
const get = async (req, res) => {
  try {
    const quotation_id = req.params.id;

    const master = await QuotationMaster.findByPk(quotation_id);
    if (!master) return res.status(404).json({ message: "Quotation not found" });

    const items = await sequelize.query(
      `
      SELECT 
        qi.*,
        p.product_name AS db_product_name,
        p.product_sale_price,
        p.product_mrp,
        c.category_name
      FROM tbl_quotation_items AS qi
      LEFT JOIN tbl_products AS p
        ON qi.product_id = p.product_id
      LEFT JOIN tbl_categories AS c
        ON qi.category_id = c.category_id
      WHERE qi.quotation_id = :quotation_id
      ORDER BY qi.quotation_item_id ASC
      `,
      {
        replacements: { quotation_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      master,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotation", error: error.message });
  }
};

/* 🟠 UPDATE QUOTATION (REPLACE CHILD) */
const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { quotation_id, quotation_items, ...updateData } = req.body;

    if (!quotation_id) {
      await transaction.rollback();
      return res.status(400).json({ message: "quotation_id is required" });
    }

    const master = await QuotationMaster.findByPk(quotation_id);
    if (!master) {
      await transaction.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    await master.update(
      {
        ...updateData,
        total_items: Array.isArray(quotation_items) ? quotation_items.length : master.total_items,
      },
      { transaction }
    );

    if (Array.isArray(quotation_items)) {
      await QuotationItem.destroy({
        where: { quotation_id },
        transaction,
      });

      const childData = quotation_items.map((item) => ({
        ...item,
        quotation_id,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        total: Number(item.price || 0) * Number(item.qty || 1),
      }));

      if (childData.length > 0) {
        await QuotationItem.bulkCreate(childData, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Quotation updated successfully",
      data: master,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error updating quotation", error: error.message });
  }
};

/* 🟤 UPDATE MASTER ONLY (STATUS) */
const masterUpdate = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { quotation_id, quotation_status } = req.body;

    if (!quotation_id || quotation_status === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: "quotation_id and quotation_status are required" });
    }

    const master = await QuotationMaster.findOne({
      where: { quotation_id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!master) {
      await transaction.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (Number(master.quotation_status) === Number(quotation_status)) {
      await transaction.rollback();
      return res.status(409).json({ message: "Quotation status already updated", data: master });
    }

    await master.update({ quotation_status }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Quotation status updated successfully",
      data: master,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

/* 🔴 DELETE QUOTATION (MASTER + CHILD) */
const deleted = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const quotation_id = req.params.id;

    await QuotationItem.destroy({
      where: { quotation_id },
      transaction,
    });

    const deletedCount = await QuotationMaster.destroy({
      where: { quotation_id },
      transaction,
    });

    if (!deletedCount) {
      await transaction.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    await transaction.commit();
    return res.status(200).json({ message: "Quotation deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error deleting quotation", error: error.message });
  }
};

/* 🟣 CUSTOMER QUOTATIONS (ONLY LOGGED-IN USER) */
const customerQuotations = async (req, res) => {
  try {
    const userId = req.currentUser.user_id;

    const quotations = await sequelize.query(
      `
      SELECT 
        qm.*,
        u.user_name   AS customer_name,
        u.user_email  AS customer_email,
        u.user_phone_number AS customer_phone
      FROM tbl_quotation_master AS qm
      LEFT JOIN tbl_users AS u
        ON qm.customer_id = u.user_id
      WHERE qm.customer_id = :userId
      ORDER BY qm.quotation_id DESC
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(quotations);
  } catch (error) {
    console.error("Customer quotation list error:", error);
    return res.status(500).json({
      message: "Error fetching customer quotations",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  quotationInvoicePdf,
  index,
  indexchild,
  get,
  update,
  customerQuotations,
  masterUpdate,
  deleted,
};
