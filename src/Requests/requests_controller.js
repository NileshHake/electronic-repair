const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const Requests = require("./requests_model");
const e = require("express");

/* 🟢 CREATE */
const store = async (req, res) => {
  try {
    const request = await Requests.create({
      ...req.body,
      requests_created_business_id:  req.currentUser.user_id,
      requests_created_by: getCreatedBy(req.currentUser),
    });

    res
      .status(201)
      .json({ message: "Request created successfully", data: request });
  } catch (error) {
    console.log("Cerate request error  ",error);
    res
      .status(500)
      .json({ message: "Error creating request", error: error.message });
  }
};

/* 🟡 READ ALL */
const index = async (req, res) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.body;

    const offset = (page - 1) * limit;

    // ✅ base sql
    let sql = `
      SELECT 
        r.requests_id,
        r.requests_created_business_id,
        r.requests_created_supplier_id,
        r.requests_created_by,
        r.request_message,
        r.request_reply,
        r.request_status,
        r.createdAt,

        -- 🏢 BUSINESS USER
        bu.user_name  AS business_name,
        bu.user_email AS business_email,
        bu.user_phone_number AS business_phone,

        -- 👤 SUPPLIER USER
        su.user_name  AS supplier_name,
        su.user_email AS supplier_email,
        su.user_phone_number AS supplier_phone

      FROM tbl_requests r

      LEFT JOIN tbl_users bu
        ON bu.user_id = r.requests_created_business_id

      LEFT JOIN tbl_users su
        ON su.user_id = r.requests_created_supplier_id

      WHERE 1 = 1
    `;

    // ✅ replacements object
    const replacements = {
      limit: Number(limit),
      offset: Number(offset),
    };

    // ✅ date filters
    if (start_date) {
      sql += ` AND DATE(r.createdAt) >= :start_date`;
      replacements.start_date = start_date;
    }

    if (end_date) {
      sql += ` AND DATE(r.createdAt) <= :end_date`;
      replacements.end_date = end_date;
    }

    // ✅ role-based filtering
    if (req.currentUser.user_type == 7) {
      // SUPPLIER
      sql += ` AND r.requests_created_supplier_id = :user_id`;
      replacements.user_id = req.currentUser.user_id;
    } 
    else if (
      req.currentUser.user_type == 3 ||
      req.currentUser.user_type == 4
    ) {
      // EMPLOYEE / DELIVERY
      sql += ` AND r.requests_created_business_id = :user_id`;
      replacements.user_id = req.currentUser.user_created_by;
    } 
    else {
      // ADMIN / BUSINESS
      sql += ` AND r.requests_created_business_id = :user_id`;
      replacements.user_id = req.currentUser.user_id;
    }

    // ✅ order + pagination
    sql += `
      ORDER BY r.requests_id DESC
      LIMIT :limit OFFSET :offset
    `;

    // ✅ execute query
    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching requests",
      error: error.message,
    });
  }
};


/* 🔵 READ SINGLE */
const Get = async (req, res) => {
  try {
    const request = await Requests.findByPk(req.params.id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    res.status(200).json(request);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching request", error: error.message });
  }
};

/* 🟠 UPDATE */
const update = async (req, res) => {
  try {
    const request = await Requests.findByPk(req.body.requests_id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    await request.update(req.body);
    res
      .status(200)
      .json({ message: "Request updated successfully", data: request });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error updating request", error: error.message });
  }
};
const statusupdate = async (req, res) => {
  try {
    const { requests_id } = req.body;

    const request = await Requests.findByPk(requests_id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await request.update({
      request_status: 1, // ✅ Accepted
    });

    return res.status(200).json({
      message: "Request status updated successfully",
      data: request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error updating request status",
      error: error.message,
    });
  }
};


/* 🔴 DELETE */
const deleted = async (req, res) => {
  try {
    console.log(req.params.id);
    
    const deleted = await Requests.destroy({
      where: { requests_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  statusupdate,
  deleted,
};
