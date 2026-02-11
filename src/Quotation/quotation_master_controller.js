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
const money = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : "0";
};

const safe = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const drawLine = (doc, y) => {
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(40, y)
    .lineTo(555, y)
    .stroke();
};

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

    // ✅ fetch business & customer info (optional but attractive)
    const [business, customer] = await Promise.all([
      quotation.business_id ? User.findByPk(quotation.business_id) : null,
      quotation.customer_id ? User.findByPk(quotation.customer_id) : null,
    ]);

    // ✅ PDF headers (download)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Quotation-${id}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    // ====== HEADER ======
    doc
      .fontSize(20)
      .fillColor("#111827")
      .text("QUOTATION INVOICE", 40, 40, { align: "left" });

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Quotation No: ${safe(quotation.quotation_no)}`, 40, 70)
      .text(`Quotation ID: ${safe(quotation.quotation_id)}`, 40, 85)
      .text(`Create Date: ${safe(quotation.create_date)}`, 40, 100)
      .text(`Expire Date: ${safe(quotation.expire_date)}`, 40, 115);

    // right side total box
    doc
      .roundedRect(380, 65, 175, 70, 8)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    doc
      .fillColor("#6b7280")
      .fontSize(10)
      .text("Grand Total", 390, 75);

    doc
      .fillColor("#111827")
      .fontSize(18)
      .text(`${money(quotation.grand_total)}`, 390, 92);

    drawLine(doc, 150);

    // ====== BUSINESS & CUSTOMER ======
    doc.fillColor("#111827").fontSize(12).text("Billed From", 40, 165);
    doc.fillColor("#111827").fontSize(12).text("Billed To", 320, 165);

    doc.fillColor("#374151").fontSize(10);
    // Business block
    doc
      .text(`${safe(business?.user_name)}`, 40, 185)
      .text(`Email: ${safe(business?.user_email)}`, 40, 200)
      .text(`Phone: ${safe(business?.user_phone_number)}`, 40, 215);

    // Customer block
    doc
      .text(`${safe(customer?.user_name)}`, 320, 185)
      .text(`Email: ${safe(customer?.user_email)}`, 320, 200)
      .text(`Phone: ${safe(customer?.user_phone_number)}`, 320, 215);

    drawLine(doc, 245);

    // ====== TABLE HEADER ======
    const tableTop = 265;
    const colX = {
      sr: 40,
      name: 75,
      price: 360,
      qty: 440,
      total: 500,
    };

    doc
      .fontSize(10)
      .fillColor("#111827")
      .text("#", colX.sr, tableTop)
      .text("Product", colX.name, tableTop)
      .text("Price", colX.price, tableTop, { width: 60, align: "right" })
      .text("Qty", colX.qty, tableTop, { width: 40, align: "right" })
      .text("Total", colX.total, tableTop, { width: 60, align: "right" });

    drawLine(doc, tableTop + 18);

    // ====== TABLE ROWS ======
    let y = tableTop + 28;

    doc.fontSize(10).fillColor("#374151");

    const lineHeight = 18;

    items.forEach((it, idx) => {
      // page break
      if (y > 760) {
        doc.addPage();
        y = 60;
      }

      const pName = safe(it.product_name);
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      const total = Number(it.total || price * qty);

      doc.text(String(idx + 1), colX.sr, y);
      doc.text(pName, colX.name, y, { width: 270 });

      doc.text(`${money(price)}`, colX.price, y, { width: 60, align: "right" });
      doc.text(String(qty), colX.qty, y, { width: 40, align: "right" });
      doc.text(`${money(total)}`, colX.total, y, { width: 60, align: "right" });

      y += lineHeight;
    });

    drawLine(doc, y + 5);

    // ====== TOTALS ======
    const subTotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
    const grandTotal = Number(quotation.grand_total || subTotal);

    y += 20;
    doc.fillColor("#111827").fontSize(11);

    doc.text("Subtotal:", 380, y, { width: 110, align: "right" });
    doc.text(`${money(subTotal)}`, 500, y, { width: 60, align: "right" });

    y += 18;
    doc.fontSize(13).text("Grand Total:", 380, y, { width: 110, align: "right" });
    doc.fontSize(13).text(`${money(grandTotal)}`, 500, y, { width: 60, align: "right" });

    // ====== FOOTER ======
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text("Thank you! This is a computer-generated quotation invoice.", 40, 790, {
        align: "center",
        width: 515,
      });

    doc.end();
  } catch (err) {
    console.log("PDF generation failed:", err);
    return res.status(500).json({ status: false, message: "PDF generation failed" });
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
