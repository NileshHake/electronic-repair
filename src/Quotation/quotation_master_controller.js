const sequelize = require("../../config/db");
const QuotationMaster = require("./quotation_master_model");
const QuotationItem = require("./quotation_master_child");
const User = require("../auth/user_model");
const { Op } = require("sequelize");
const PDFDocument = require("pdfkit");

/* 🟢 CREATE QUOTATION (MASTER + CHILD) */
const store = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { quotation_items, ...masterData } = req.body;

    // ✅ Generate quotation_no (simple)
    const quotationNo = `Q-${Date.now()}`;

    // ✅ set ids properly (do not always overwrite customer_id from payload)
    const businessId = req.currentUser?.user_id;
    const customerId = masterData.customer_id || req.currentUser?.user_id;

    const master = await QuotationMaster.create(
      {
        ...masterData,
        quotation_no: masterData.quotation_no || quotationNo,

        business_id: businessId,
        customer_id: customerId,
        created_by: req.currentUser?.user_id,

        total_items: Array.isArray(quotation_items) ? quotation_items.length : 0,
      },
      { transaction }
    );

    if (Array.isArray(quotation_items) && quotation_items.length > 0) {
      const childData = quotation_items.map((item) => ({
        ...item,
        quotation_id: master.quotation_id,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        total: Number(item.price || 0) * Number(item.qty || 1),
      }));

      await QuotationItem.bulkCreate(childData, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Quotation created successfully",
      data: master, // ✅ master contains quotation_id
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);

    return res.status(500).json({
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

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // ====== HEADER ======
    doc
      .fillColor("#111827")
      .fontSize(24)
      .text("QUOTATION", 40, 40);

    // Header Meta Data (Right Aligned)
    const topAlign = 45;
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`No: ${safe(quotation.quotation_no)}`, 400, topAlign, { align: "right" })
      .text(`Date: ${safe(quotation.create_date)}`, 400, topAlign + 15, { align: "right" })
      .text(`Expires: ${safe(quotation.expire_date)}`, 400, topAlign + 30, { align: "right" });

    drawLine(doc, 100);

    // ====== BILLING SECTION ======
    const billingTop = 130;
    
    // Billed From (Business)
    doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text("FROM:", 40, billingTop);
    
    // Billed To (Customer)
    doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text("BILL TO:", 320, billingTop);
    doc.fillColor("#374151").font("Helvetica").fontSize(10)
      .text(`${safe(customer?.user_name)}`, 320, billingTop + 15)
      .text(`${safe(customer?.user_email)}`, 320, billingTop + 30)
      .text(`${safe(customer?.user_phone_number)}`, 320, billingTop + 45);

    // ====== TABLE HEADER ======
    const tableTop = 230;
    const colX = {
      sr: 40,
      name: 70,
      price: 350,
      qty: 430,
      total: 500,
    };

    doc.rect(40, tableTop, 520, 25).fill("#f3f4f6"); // Header background
    
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("SR.", colX.sr + 5, tableTop + 8)
      .text("DESCRIPTION", colX.name, tableTop + 8)
      .text("UNIT PRICE", colX.price, tableTop + 8, { width: 70, align: "right" })
      .text("QTY", colX.qty, tableTop + 8, { width: 40, align: "right" })
      .text("AMOUNT", colX.total, tableTop + 8, { width: 60, align: "right" });

    // ====== TABLE ROWS ======
    let y = tableTop + 35;
    doc.font("Helvetica").fontSize(9).fillColor("#374151");

    items.forEach((it, idx) => {
      if (y > 730) { 
        doc.addPage();
        y = 50;
      }

      const pName = safe(it.product_name);
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      const total = Number(it.total || price * qty);

      doc.text(String(idx + 1), colX.sr + 5, y);
      doc.text(pName, colX.name, y, { width: 260 });
      doc.text(`${money(price)}`, colX.price, y, { width: 70, align: "right" });
      doc.text(String(qty), colX.qty, y, { width: 40, align: "right" });
      doc.text(`${money(total)}`, colX.total, y, { width: 60, align: "right" });

      y += 25; // Row spacing
      
      // Light border between items
      doc.moveTo(40, y - 10).lineTo(560, y - 10).strokeColor("#f3f4f6").lineWidth(1).stroke();
    });

    // ====== TOTALS SECTION ======
    const subTotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
    const grandTotal = Number(quotation.grand_total || subTotal);

    y += 10;
    if (y > 750) { doc.addPage(); y = 50; }

    doc.font("Helvetica").fontSize(10).fillColor("#6b7280");
    doc.text("Subtotal", 380, y, { width: 110, align: "right" });
    doc.fillColor("#111827").text(`${money(subTotal)}`, 500, y, { width: 60, align: "right" });

    y += 20;
    // Grand Total highlight
    doc.rect(380, y - 5, 185, 30).fill("#f9fafb"); 
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(12);
    doc.text("Grand Total", 390, y + 2, { width: 100, align: "left" });
    doc.text(`${money(grandTotal)}`, 495, y + 2, { width: 65, align: "right" });

    // ====== FOOTER ======
    const footerText = "Thank you for your business! This quotation is valid until the expiration date listed above.";
    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(footerText, 40, 780, { align: "center", width: 515 });

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// --- Helper Functions ---
const safe = (val) => val || "N/A";
const money = (val) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const drawLine = (doc, y) => {
  doc.moveTo(40, y).lineTo(560, y).strokeColor("#e5e7eb").lineWidth(1).stroke();
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
