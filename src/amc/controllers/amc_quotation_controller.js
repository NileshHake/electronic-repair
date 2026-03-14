
const sequelize = require("../../../config/db");
const { QueryTypes } = require("sequelize");

const AMCQuotations = require("../models/amc_quotations_model");
const AMCQuotationItems = require("../models/amc_quotation_items_model");
const { getCreatedBy } = require("../../helper/CurrentUser");
const AmcRequests = require("../models/amc_request_model");
const { logger } = require("sequelize/lib/utils/logger");
const { generateNumber } = require("../../invoice number/invoice_number_controller");
const AmcContracts = require("../models/amc_contract_model");


// ================= STORE =================

const store = async (req, res) => {

  try {

    const {
      request_id,
      customer_id,
      vendor_id,
      customer_address_id,
      duration_months,
      service_visits,
      coverage_type,
      gst_percent
    } = req.body;

    /* Convert FormData items to array */

    const formattedItems = [];

    Object.keys(req.body).forEach((key) => {

      const match = key.match(/items\[(\d+)\]\[(.+)\]/);

      if (match) {

        const index = match[1];
        const field = match[2];

        if (!formattedItems[index]) {
          formattedItems[index] = {};
        }

        formattedItems[index][field] = req.body[key];

      }

    });

    const items = formattedItems.filter(Boolean);

    /* Calculation */

    let base_amount = 0;
    let quotation_number = await generateNumber({
      businessId: 1,
      type: "amcquotation",
    });
    items.forEach((item) => {

      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);

      base_amount += qty * price;

    });

    const gst_amount = base_amount * (gst_percent / 100);

    const total_amount = base_amount + gst_amount;

    const quotation = await AMCQuotations.create({
      request_id,
      customer_id,
      vendor_id,
      customer_address_id,
      created_by: getCreatedBy(req.currentUser),
      base_amount,
      gst_percent,
      gst_amount,
      total_amount,
      duration_months,
      quotation_number,
      service_visits,
      coverage_type

    });

    for (let item of items) {

      await AMCQuotationItems.create({

        quotation_id: quotation.quotation_id,
        product_id: item.product_id,
        product_name: item.product_name,
        problem_note: item.problem_note,
        qty: item.qty,
        price: item.price,
        total: item.total

      });

    }
    if (quotation) {
      const request = await AmcRequests.findByPk(request_id);
      request.quotation_id = quotation.quotation_id;
      await request.save();
    }
    res.status(201).json({
      message: "AMC quotation created successfully",
      data: quotation
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error creating quotation",
      error: error.message
    });

  }

};

// ================= LIST (NATIVE QUERY) =================

const index = async (req, res) => {
  try {
    const userType = Number(req.currentUser.user_type);
    const userId = req.currentUser.user_id;
    const createdBy = req.currentUser.user_created_by;

    let whereClauses = [];
    let replacements = {};

    if (userType === 1 || userType === 2) {
      whereClauses.push("q.vendor_id = :user_id");
      replacements.user_id = userId;
    } else if (userType === 3) {
      whereClauses.push("q.vendor_id = :created_by");
      replacements.created_by = createdBy;
    } else if (userType === 4 || userType === 5) {
      whereClauses.push("q.vendor_id = :created_by");
      replacements.user_id = userId;
    } else if (userType === 6) {
      whereClauses.push("q.customer_id = :user_id");
      replacements.user_id = userId;
    }

    const whereCondition =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT
        q.*,

        a.customer_address_description,
        a.customer_address_city,
        a.customer_address_taluka,
        a.customer_address_district,
        a.customer_address_state,
        a.customer_address_pincode,
        a.customer_address_mobile,

        cu.user_name AS customer_name,
        cu.user_email AS customer_email,
        cu.user_phone_number AS customer_phone,

        v.user_name AS vendor_name,
        v.user_email AS vendor_email,
        v.user_phone_number AS vendor_phone

      FROM tbl_amc_quotations q

      LEFT JOIN tbl_customer_addresses a
        ON q.customer_address_id = a.customer_address_id

      LEFT JOIN tbl_users cu
        ON q.customer_id = cu.user_id

      LEFT JOIN tbl_users v
        ON q.vendor_id = v.user_id

      ${whereCondition}

      ORDER BY q.quotation_id DESC
    `;

    const data = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log("Error fetching quotations:", error);

    return res.status(500).json({
      message: "Error fetching quotations",
      error: error.message,
    });
  }
};

// ================= SINGLE =================

const Get = async (req, res) => {

  try {

    const id = req.params.id;

    const quotationData = await sequelize.query(
      `SELECT
        q.*,

        a.customer_address_description,
        a.customer_address_city,
        a.customer_address_taluka,
        a.customer_address_district,
        a.customer_address_state,
        a.customer_address_pincode,
        a.customer_address_mobile,

        cu.user_id AS customer_id,
        cu.user_name AS customer_name,
        cu.user_email AS customer_email,
        cu.user_phone_number AS customer_phone,

        v.user_id AS vendor_id,
        v.user_name AS vendor_name,
        v.user_email AS vendor_email,
        v.user_phone_number AS vendor_phone

      FROM tbl_amc_quotations q

      LEFT JOIN tbl_customer_addresses a
        ON q.customer_address_id = a.customer_address_id

      LEFT JOIN tbl_users cu
        ON q.customer_id = cu.user_id

      LEFT JOIN tbl_users v
        ON q.vendor_id = v.user_id

      WHERE q.quotation_id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!quotationData.length) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    const quotation = quotationData[0];

    const items = await sequelize.query(
      `SELECT *
   FROM tbl_amc_quotation_items
   WHERE quotation_id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    return res.status(200).json({

      quotation: {
        quotation_id: quotation.quotation_id,
        quotation_number: quotation.quotation_number,
        quotation_status: quotation.quotation_status,
        duration_months: quotation.duration_months,
        service_visits: quotation.service_visits,
        coverage_type: quotation.coverage_type,
        base_amount: quotation.base_amount,
        gst_percent: quotation.gst_percent,
        gst_amount: quotation.gst_amount,
        total_amount: quotation.total_amount,
        createdAt: quotation.createdAt
      },

      customer: {
        id: quotation.customer_id,
        name: quotation.customer_name,
        email: quotation.customer_email,
        phone: quotation.customer_phone
      },

      vendor: {
        id: quotation.vendor_id,
        name: quotation.vendor_name,
        email: quotation.vendor_email,
        phone: quotation.vendor_phone
      },

      address: {
        description: quotation.customer_address_description,
        city: quotation.customer_address_city,
        taluka: quotation.customer_address_taluka,
        district: quotation.customer_address_district,
        state: quotation.customer_address_state,
        pincode: quotation.customer_address_pincode,
        mobile: quotation.customer_address_mobile
      },

      items: items

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Error fetching quotation",
      error: error.message
    });

  }

};
const GetchildGet = async (req, res) => {
  try {

    const id = req.params.id;


    const items = await AMCQuotationItems.findAll({
      where: { quotation_id: id }
    });

    res.status(200).json(items);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching quotation",
      error: error.message
    });

  }
};


// ================= UPDATE =================
const update = async (req, res) => {

  try {

    const {
      quotation_id,
      duration_months,
      service_visits,
      coverage_type,
      gst_percent
    } = req.body;

    /* Convert FormData items to array */

    const formattedItems = [];

    Object.keys(req.body).forEach((key) => {

      const match = key.match(/items\[(\d+)\]\[(.+)\]/);

      if (match) {

        const index = match[1];
        const field = match[2];

        if (!formattedItems[index]) {
          formattedItems[index] = {};
        }

        formattedItems[index][field] = req.body[key];

      }

    });

    const items = formattedItems.filter(Boolean);

    /* Find quotation */

    const quotation = await AMCQuotations.findByPk(quotation_id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    /* Calculate subtotal */

    let base_amount = 0;

    items.forEach((item) => {

      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);

      base_amount += qty * price;

    });

    const gst_amount = base_amount * (Number(gst_percent) / 100);
    const total_amount = base_amount + gst_amount;

    /* Update quotation */

    await quotation.update({
      base_amount,
      gst_percent: Number(gst_percent),
      gst_amount,
      total_amount,
      duration_months,
      service_visits,
      coverage_type
    });

    /* Delete old quotation items */

    await AMCQuotationItems.destroy({
      where: { quotation_id }
    });

    /* Insert new items */

    for (let item of items) {

      await AMCQuotationItems.create({

        quotation_id,
        product_id: item.product_id,
        product_name: item.product_name,
        problem_note: item.problem_note,
        qty: Number(item.qty),
        price: Number(item.price),
        total: Number(item.qty || 1) * Number(item.price || 0)

      });

    }

    res.status(200).json({
      message: "AMC quotation updated successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error updating quotation",
      error: error.message
    });

  }

};


const statusupdate = async (req, res) => {

  try {

    const { quotation_id, quotation_status } = req.body;

    const quotation = await AMCQuotations.findByPk(quotation_id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    /* Update quotation status */

    await quotation.update({
      quotation_status
    });

    /* If quotation rejected */

    if (quotation_status === "Reject") {

      await AmcRequests.update(
        { request_status: "Rejected By Customer" },
        { where: { quotation_id } }
      );

    }

    /* If quotation approved → create contract */

    if (quotation_status === "Approved") {

      const startDate = new Date();

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year AMC

      await AmcContracts.create({
        quotation_id: quotation.quotation_id,
        customer_id: quotation.customer_id,
        vendor_id: quotation.vendor_id,
        start_date: startDate,
        end_date: endDate,      
        total_visits: 4,
        remaining_visits: 4,
        contract_status: "active",
        created_by: req.currentUser.user_id
      });

      await AmcRequests.update(
        { request_status: "Contract Created" },
        { where: { quotation_id } }
      );

    }

    res.status(200).json({
      message: "Quotation status updated successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error updating quotation status",
      error: error.message
    });

  }

};
// ================= DELETE =================

const deleted = async (req, res) => {
  try {

    const id = req.params.id;

    const quotation = await AMCQuotations.findByPk(id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    await AMCQuotationItems.destroy({
      where: { quotation_id: id }
    });

    await quotation.destroy();

    res.status(200).json({
      message: "Quotation deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting quotation",
      error: error.message
    });

  }
};


module.exports = {
  store,
  index,
  GetchildGet,
  Get,
  update,
  statusupdate,
  deleted
};