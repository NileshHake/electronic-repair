const BeadingRequest = require("./beading_model");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage } = require("../helper/fileUpload");
const sequelize = require("../../config/db");
// ✅ STORE
const store = async (req, res) => {
  try {
    // ✅ multiple images upload
    let beading_images = [];

    // frontend should send field name: beading_images
    if (req.files && req.files.beading_images) {
      const files = Array.isArray(req.files.beading_images)
        ? req.files.beading_images
        : [req.files.beading_images];

      for (const file of files) {
        const savedPath = await saveImage(file, "beading_images");
        beading_images.push(savedPath);
      }
    }

    // ✅ convert to string
    const imagesString = beading_images.length > 0 ? beading_images.join(",") : null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const payload = {
      ...req.body,
      beading_customer_id: req.currentUser.user_id,
      beading_created_by: getCreatedBy(req.currentUser),
      beading_request_images: imagesString,
      expires_at: expiresAt,
      beading_vender_accepted_id: null, // default null
    };

    const created = await BeadingRequest.create(payload);

    res.status(201).json({
      message: "Beading request created successfully",
      data: created,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating beading request",
      error: error.message,
    });
  }
};

// ✅ LIST
const index = async (req, res) => {
  try {
    const customerId = req.currentUser.user_id;
    const rows = await sequelize.query(
      `
      SELECT 
        br.beading_request_id,
        br.beading_request_title,
        br.beading_request_description,
        br.beading_vendor_details,
        br.beading_vender_accepted_id,
        br.beading_budget_min,
        br.beading_budget_max,
        br.beading_location,
        br.beading_request_images,
        br.beading_request_status,
        br.expires_at,

        -- 👤 VENDOR DETAILS
        u.user_name        AS vendor_name,
        u.user_email       AS vendor_email,
        u.user_phone_number AS vendor_phone

      FROM tbl_beading_request br
      LEFT JOIN tbl_users u
        ON u.user_id = br.beading_vender_accepted_id
WHERE br.beading_customer_id = :customerId
      ORDER BY br.beading_request_id ASC
      `,
      {
        replacements: { customerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "Error fetching beading requests",
      error: error.message,
    });
  }
};
const globalList = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;

    const offset = (page - 1) * limit;

    const where = [];
    const replacements = { limit, offset };

    if (start_date) {
      where.push(`DATE(br.createdAt) >= :start_date`);
      replacements.start_date = start_date;
    }

    if (end_date) {
      where.push(`DATE(br.createdAt) <= :end_date`);
      replacements.end_date = end_date;
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await sequelize.query(
      `
      SELECT 
        br.beading_request_id,
        br.beading_request_title,
        br.beading_vendor_details,
        br.beading_request_description,
        br.beading_budget_min,
        br.beading_budget_max,
        br.beading_location,
        br.beading_request_images,
        br.beading_request_status,
        br.expires_at,
        br.createdAt,

        u.user_name AS customer_name,
        u.user_email AS customer_email,
        u.user_phone_number AS customer_phone

      FROM tbl_beading_request br
      LEFT JOIN tbl_users u
        ON u.user_id = br.beading_customer_id

      ${whereSql}
      ORDER BY br.beading_request_id ASC
      LIMIT :limit OFFSET :offset
      `,
      { type: sequelize.QueryTypes.SELECT, replacements }
    );

    // ✅ hasMore check
    const hasMore = rows.length === limit;

    res.status(200).json({
      rows,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beading requests",
      error: error.message,
    });
  }
};



// ✅ SINGLE
const Get = async (req, res) => {
  try {
    const row = await BeadingRequest.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });
    res.status(200).json(row);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beading request",
      error: error.message,
    });
  }
};

// ✅ UPDATE
const update = async (req, res) => {
  try {
    const row = await BeadingRequest.findByPk(req.body.beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

    // if new images coming in update
    let beading_images = [];
    if (req.files && req.files.beading_images) {
      const files = Array.isArray(req.files.beading_images)
        ? req.files.beading_images
        : [req.files.beading_images];

      for (const file of files) {
        const savedPath = await saveImage(file, "beading_images");
        beading_images.push(savedPath);
      }
    }

    const imagesString =
      beading_images.length > 0 ? beading_images.join(",") : row.beading_request_images;

    await row.update({
      ...req.body,
      beading_request_images: imagesString,
    });

    res.status(200).json({ message: "Beading request updated successfully", data: row });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating beading request",
      error: error.message,
    });
  }
};

// ✅ DELETE
const deleted = async (req, res) => {
  try {
    const done = await BeadingRequest.destroy({
      where: { beading_request_id: req.params.id },
    });

    if (!done) return res.status(404).json({ message: "Beading request not found" });

    res.status(200).json({ message: "Beading request deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting beading request",
      error: error.message,
    });
  }
};

const vendorBeadding = async (req, res) => {
  try {
    const { beading_request_id, vendor_beading_amount } = req.body;

    const amount = Number(vendor_beading_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid vendor_beading_amount" });
    }

    const row = await BeadingRequest.findByPk(beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

    const vendorDetails = {
      vendor_id: req.currentUser.user_id,
      vendor_name: req.currentUser.user_name,
      vendor_email: req.currentUser.user_email,
      vendor_phone: req.currentUser.user_phone_number,
      vendor_beading_amount: amount,
      accepted_at: new Date().toISOString(),
    };

    // ✅ ALWAYS normalize to array
    const vendorArray = normalizeVendorDetails(row.beading_vendor_details);

    // ✅ update if same vendor already exists
    const idx = vendorArray.findIndex((v) => Number(v.vendor_id) === Number(vendorDetails.vendor_id));
    if (idx >= 0) vendorArray[idx] = { ...vendorArray[idx], ...vendorDetails };
    else vendorArray.push(vendorDetails);

    // ✅ store ONLY ONCE
    await row.update({
      beading_vendor_details: JSON.stringify(vendorArray),
      beading_request_status: 0,
    });

    return res.status(200).json({
      message: "Vendor bid saved",
      data: {
        beading_request_id: row.beading_request_id,
        beading_vendor_details: vendorArray, // ✅ return clean array
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error", error: error.message });
  }
};
const normalizeVendorDetails = (val) => {
  if (!val) return [];

  try {
    let parsed = JSON.parse(val);

    // ✅ if it was double-stringified, parse again
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};


const vendorAccept = async (req, res) => {
  try {
    const { beading_request_id, beading_vender_accepted_id } = req.body;

    const row = await BeadingRequest.findByPk(beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

    await row.update({
      beading_vender_accepted_id: beading_vender_accepted_id,
      beading_request_status: 1,
    });

    res.status(200).json({ message: "Beading request accepted", data: row });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting request",
      error: error.message,
    });
  }
};

module.exports = { store, index, Get, update, deleted, vendorAccept, globalList, vendorBeadding };
