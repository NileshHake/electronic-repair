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
      return res
        .status(404)
        .json({ status: false, message: "Quotation not found" });
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Quotation-${id}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // ===== HEADER =====
    doc.fillColor("#111827").fontSize(24).text("QUOTATION", 40, 40);

    // Header Meta Data (Right Aligned)
    const topAlign = 45;
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`No: ${safe(quotation.quotation_no)}`, 400, topAlign, {
        align: "right",
      })
      .text(`Date: ${safe(quotation.create_date)}`, 400, topAlign + 15, {
        align: "right",
      })
      .text(`Expires: ${safe(quotation.expire_date)}`, 400, topAlign + 30, {
        align: "right",
      });

    drawLine(doc, 100);

    // ===== BILLING SECTION =====
    const billingTop = 130;

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827");
    doc.text("FROM:", 40, billingTop);
    doc.text("BILL TO:", 320, billingTop);

    doc.font("Helvetica").fontSize(10).fillColor("#374151");

    // Business Info
    doc.text(safe(business?.user_name), 40, billingTop + 15);
    doc.text(safe(business?.user_email), 40, billingTop + 30);
    doc.text(safe(business?.user_phone_number), 40, billingTop + 45);

    let fromY = billingTop + 60;
    buildAddressLines(business).forEach((line) => {
      doc.text(line, 40, fromY);
      fromY += 14;
    });

    // Customer Info
    doc.text(safe(customer?.user_name), 320, billingTop + 15);
    doc.text(safe(customer?.user_email), 320, billingTop + 30);
    doc.text(safe(customer?.user_phone_number), 320, billingTop + 45);

    let toY = billingTop + 60;
    buildAddressLines(customer).forEach((line) => {
      doc.text(line, 320, toY);
      toY += 14;
    });

    // ===== TABLE HEADER =====
    const tableTop = 250;
    const colX = {
      sr: 40,
      name: 70,
      price: 350,
      qty: 430,
      total: 500,
    };

    doc.rect(40, tableTop, 520, 25).fill("#f3f4f6");

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("SR.", colX.sr + 5, tableTop + 8)
      .text("DESCRIPTION", colX.name, tableTop + 8)
      .text("UNIT PRICE", colX.price, tableTop + 8, {
        width: 70,
        align: "right",
      })
      .text("QTY", colX.qty, tableTop + 8, { width: 40, align: "right" })
      .text("AMOUNT", colX.total, tableTop + 8, { width: 60, align: "right" });

    // ===== TABLE ROWS =====
    let y = tableTop + 35;
    doc.font("Helvetica").fontSize(9).fillColor("#374151");

    items.forEach((it, idx) => {
      if (y > 730) {
        doc.addPage();
        y = 50;
      }

      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      const total = Number(it.total || price * qty);

      doc.text(String(idx + 1), colX.sr + 5, y);
      doc.text(safe(it.product_name), colX.name, y, { width: 260 });
      doc.text(moneyINR(price), colX.price, y, { width: 70, align: "right" });
      doc.text(String(qty), colX.qty, y, { width: 40, align: "right" });
      doc.text(moneyINR(total), colX.total, y, { width: 60, align: "right" });

      y += 25;

      doc
        .moveTo(40, y - 10)
        .lineTo(560, y - 10)
        .strokeColor("#f3f4f6")
        .lineWidth(1)
        .stroke();
    });

    // ===== GST + TOTAL SECTION =====
    const gstPercent = Number(quotation.gst_percentage || 18);

    let baseTotal = Number(quotation.base_total || 0);
    let gstTotal = Number(quotation.gst_total || 0);
    let grandTotal = Number(quotation.grand_total || 0);

    // If only grand_total exists and it includes GST, reverse it
    if ((!baseTotal || !gstTotal) && grandTotal) {
      const base = grandTotal / (1 + gstPercent / 100);
      baseTotal = base;
      gstTotal = grandTotal - base;
    }

    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    baseTotal = round2(baseTotal);
    gstTotal = round2(gstTotal);
    grandTotal = round2(grandTotal || baseTotal + gstTotal);

    y += 15;
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    doc.font("Helvetica").fontSize(10).fillColor("#6b7280");
    doc.text("Subtotal (Base)", 380, y, { width: 110, align: "right" });
    doc.fillColor("#111827").text(moneyINR(baseTotal), 500, y, {
      width: 60,
      align: "right",
    });

    y += 18;
    doc.fillColor("#6b7280").text(`GST (${gstPercent}%)`, 380, y, {
      width: 110,
      align: "right",
    });
    doc.fillColor("#111827").text(moneyINR(gstTotal), 500, y, {
      width: 60,
      align: "right",
    });

    y += 22;
    doc.rect(380, y - 6, 185, 30).fill("#f9fafb");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(12);
    doc.text("Grand Total", 390, y + 2);
    doc.text(moneyINR(grandTotal), 495, y + 2, { width: 65, align: "right" });

    // ===== UPI PAY SECTION (QR + AUTO AMOUNT) =====
    const advanceAmount = Number((grandTotal * 0.5).toFixed(2));
    const upiId = "prashantdhaigude530@okaxis"; // ✅ default UPI ID
    const payeeName = business?.user_name || "Business";
    const note = `Quotation ${safe(quotation.quotation_no)}`;
    const txnRef = `QT-${id}`;

    const upiUri = buildUpiUri({
      pa: upiId,
      pn: payeeName,
      am: advanceAmount, // ✅ auto-fill amount
      tn: note,
      tr: txnRef,
    });

    y += 55;
    if (y > 670) {
      doc.addPage();
      y = 50;
    }

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Pay via UPI", 40, y);
    doc.font("Helvetica").fontSize(9).fillColor("#374151");
    doc.text(`UPI ID: ${upiId}`, 40, y + 18);
    doc.text(`Amount: ${moneyINR(advanceAmount)}`, 40, y + 34);
    doc.text(`Note: ${note}`, 40, y + 50, { width: 260 });

    const qrBuffer = await QRCode.toBuffer(upiUri, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
    });

    doc.image(qrBuffer, 420, y + 5, { width: 120, height: 120 });

    doc
      .fontSize(8)
      .fillColor("#6b7280")
      .text("Scan & Pay (amount auto-filled)", 420, y + 130, {
        width: 140,
        align: "center",
      });

    y += 170;

    // ===== TERMS & CONDITIONS =====
    const terms = [
      "This quotation is valid until the expiration date mentioned above.",
      "Prices mentioned are exclusive of applicable taxes unless stated otherwise.",
      "50% advance payment is required to confirm the order.",
      "Delivery timeline will be confirmed after order confirmation.",
      "Goods once sold will not be taken back or exchanged.",
      "Warranty (if applicable) will be provided as per manufacturer terms.",
      "Any additional work will be charged separately.",
    ];

    if (y > 680) {
      doc.addPage();
      y = 50;
    }

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
    doc.text("Terms & Conditions", 40, y);

    y += 20;
    doc.font("Helvetica").fontSize(9).fillColor("#374151");

    terms.forEach((term) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(`• ${term}`, 50, y, { width: 500 });
      y += 18;
    });

    // ===== FOOTER =====
    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Thank you for your business! This quotation is valid until the expiration date listed above.",
        40,
        780,
        { align: "center", width: 515 }
      );

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

// ===== HELPERS =====
const safe = (val) => (val ? val : "N/A");

const moneyINR = (val) => {
  const n = Number(val || 0);
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const buildAddressLines = (u) => {
  if (!u) return [];

  const line1 = [u.user_address_description, u.user_address_block]
    .filter(Boolean)
    .join(", ");

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
  params.set("am", Number(am || 0).toFixed(2)); // ✅ auto-fill amount
  params.set("cu", "INR");
  if (tn) params.set("tn", tn);
  if (tr) params.set("tr", tr);
  return `upi://pay?${params.toString()}`;
};

const drawLine = (doc, y) => {
  doc
    .moveTo(40, y)
    .lineTo(560, y)
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .stroke();
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
