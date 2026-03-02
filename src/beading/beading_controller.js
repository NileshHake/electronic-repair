const BeadingRequest = require("./beading_model");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage } = require("../helper/fileUpload");
const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");
const BeadingRequestVendor = require("./beading_child_model");
const User = require("../auth/user_model");

/* =========================================================
   ✅ STORE (same as your code) - only master insert
========================================================= */
const store = async (req, res) => {
  try {
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

    const imagesString = beading_images.length > 0 ? beading_images.join(",") : null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const payload = {
      ...req.body,
      beading_customer_id: req.currentUser.user_id,
      beading_created_by: getCreatedBy(req.currentUser),
      beading_request_images: imagesString,
      expires_at: expiresAt,
      beading_vender_accepted_id: null,
      // ✅ remove beading_vendor_details from payload if still coming from frontend
      beading_vendor_details: null,
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

/* =========================================================
   ✅ LIST (Customer's requests) - now show accepted vendor info
========================================================= */
const index = async (req, res) => {
  try {
    const customerId = req.currentUser.user_id;

    const rows = await sequelize.query(
      `
      SELECT 
        br.beading_request_id,
        br.beading_request_title,
        br.beading_request_description,
        br.beading_vender_accepted_id,
        br.beading_budget_min,
        br.beading_budget_max,
        br.beading_location,
        br.beading_request_images,
        br.beading_request_status,
        br.expires_at,

        u.user_name         AS vendor_name,
        u.user_email        AS vendor_email,
        u.user_phone_number AS vendor_phone

      FROM tbl_beading_request br
      LEFT JOIN tbl_users u
        ON u.user_id = br.beading_vender_accepted_id
      WHERE br.beading_customer_id = :customerId
      ORDER BY br.beading_request_id ASC
      `,
      {
        replacements: { customerId },
        type: QueryTypes.SELECT,
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

/* =========================================================
   ✅ GLOBAL LIST (same, but remove beading_vendor_details)
========================================================= */
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
        br.beading_request_description,
        br.beading_budget_min,
        br.beading_budget_max,
        br.beading_location,
        br.beading_request_images,
        br.beading_request_status,
        br.beading_vender_accepted_id,
        br.expires_at,
        br.createdAt,

        u.user_name         AS customer_name,
        u.user_email        AS customer_email,
        u.user_phone_number AS customer_phone

      FROM tbl_beading_request br
      LEFT JOIN tbl_users u
        ON u.user_id = br.beading_customer_id

      ${whereSql}
      ORDER BY br.beading_request_id ASC
      LIMIT :limit OFFSET :offset
      `,
      { type: QueryTypes.SELECT, replacements }
    );

    const hasMore = rows.length === limit;

    res.status(200).json({ rows, page, limit, hasMore });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beading requests",
      error: error.message,
    });
  }
};

/* =========================================================
   ✅ SINGLE (include vendor offers child + vendor user join)
========================================================= */


const Get = async (req, res) => {
  try {
    const id = req.params.id;

    /* =====================================================
       1️⃣ GET MASTER + ACCEPTED VENDOR
    ===================================================== */
    const masterRows = await sequelize.query(
      `
      SELECT 
        br.*,

        -- accepted vendor details
        u.user_id            AS accepted_vendor_id,
        u.user_name          AS accepted_vendor_name,
        u.user_email         AS accepted_vendor_email,
        u.user_phone_number  AS accepted_vendor_phone

      FROM tbl_beading_request br
      LEFT JOIN tbl_users u
        ON u.user_id = br.beading_vender_accepted_id

      WHERE br.beading_request_id = :id
      LIMIT 1
      `,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!masterRows.length) {
      return res.status(404).json({ message: "Beading request not found" });
    }

    const master = masterRows[0];

    /* =====================================================
       2️⃣ GET ALL VENDOR OFFERS (CHILD TABLE)
    ===================================================== */
    const vendorOffers = await sequelize.query(
      `
      SELECT 
        v.br_vendor_id,
        v.beading_request_id,
        v.vendor_id,
        v.vendor_beading_amount,
        v.vendor_note,
        v.vendor_offer_status,
        v.offered_at,
        v.accepted_at,

        u.user_name         AS vendor_name,
        u.user_email        AS vendor_email,
        u.user_phone_number AS vendor_phone

      FROM tbl_beading_request_vendor v
      LEFT JOIN tbl_users u
        ON u.user_id = v.vendor_id

      WHERE v.beading_request_id = :id
      ORDER BY v.br_vendor_id ASC
      `,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    /* =====================================================
       3️⃣ FORMAT CLEAN RESPONSE
    ===================================================== */
    const response = {
      ...master,

      acceptedVendor: master.accepted_vendor_id
        ? {
          user_id: master.accepted_vendor_id,
          user_name: master.accepted_vendor_name,
          user_email: master.accepted_vendor_email,
          user_phone_number: master.accepted_vendor_phone,
        }
        : null,

      vendorOffers: vendorOffers,
    };

    res.status(200).json(response);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching beading request",
      error: error.message,
    });
  }
};
/* =========================================================
   ✅ UPDATE (same as your code)
========================================================= */
const update = async (req, res) => {
  try {
    const row = await BeadingRequest.findByPk(req.body.beading_request_id);
    if (!row) return res.status(404).json({ message: "Beading request not found" });

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

/* =========================================================
   ✅ DELETE (master delete + delete child offers)
========================================================= */
const deleted = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;

    // delete child first
    await BeadingRequestVendor.destroy({
      where: { beading_request_id: id },
      transaction: t,
    });

    const done = await BeadingRequest.destroy({
      where: { beading_request_id: id },
      transaction: t,
    });

    if (!done) {
      await t.rollback();
      return res.status(404).json({ message: "Beading request not found" });
    }

    await t.commit();
    res.status(200).json({ message: "Beading request deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Error deleting beading request",
      error: error.message,
    });
  }
};

/* =========================================================
   ✅ CHILD CRUD: Vendor Offer (UPSERT: vendor can update own quote)
   Body: { beading_request_id, vendor_beading_amount, vendor_note }
========================================================= */
const vendorOfferUpsert = async (req, res) => {
  try {
    const { beading_request_id, vendor_beading_amount, vendor_note } = req.body;

    const amount = Number(vendor_beading_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid vendor_beading_amount" });
    }

    const requestRow = await BeadingRequest.findByPk(beading_request_id);
    if (!requestRow) return res.status(404).json({ message: "Beading request not found" });

    // optional: block offers if expired / accepted
    if (requestRow.beading_request_status === 1) {
      return res.status(400).json({ message: "Request already accepted" });
    }

    const vendorId = req.currentUser.user_id;

    const exists = await BeadingRequestVendor.findOne({
      where: { beading_request_id, vendor_id: vendorId },
    });


    let saved;


    saved = await BeadingRequestVendor.create({
      beading_request_id,
      vendor_id: vendorId,
      vendor_beading_amount: amount,
      vendor_note: vendor_note || null,
      vendor_offer_status: 0,
      offered_at: new Date(),
      accepted_at: null,
    });

    return res.status(200).json({
      message: "Vendor offer saved",
      data: saved,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving vendor offer", error: error.message });
  }
};

/* =========================================================
   ✅ CHILD LIST: Get all offers for a request (with vendor user join)
   Params: :beading_request_id
========================================================= */
const vendorOfferListByRequest = async (req, res) => {
  try {
    const { beading_request_id } = req.params;

    if (!beading_request_id) {
      return res.status(400).json({ message: "beading_request_id is required" });
    }

    const rows = await sequelize.query(
      `
      SELECT
        brv.br_vendor_id,
        brv.beading_request_id,
        brv.vendor_id,
        brv.vendor_beading_amount,
        brv.vendor_note,
        brv.vendor_offer_status,
        brv.offered_at,
        brv.accepted_at,

        u.user_name        AS vendor_name,
        u.user_email       AS vendor_email,
        u.user_phone_number AS vendor_phone

      FROM tbl_beading_request_vendor AS brv
      LEFT JOIN tbl_users AS u
        ON u.user_id = brv.vendor_id

      WHERE brv.beading_request_id = :beading_request_id
      ORDER BY brv.br_vendor_id ASC
      `,
      {
        replacements: { beading_request_id },
        type: QueryTypes.SELECT,
      }
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.log("vendorOfferListByRequest error:", error);
    return res.status(500).json({
      message: "Error fetching vendor offers",
      error: error.message,
    });
  }
};


/* =========================================================
   ✅ CHILD SINGLE: Vendor offer by id
   Params: :br_vendor_id
========================================================= */
const vendorOfferGet = async (req, res) => {
  try {
    const br_vendor_id = req.params.br_vendor_id;

    const row = await BeadingRequestVendor.findByPk(br_vendor_id, {
      include: [
        {
          model: User,
          as: "vendor",
          attributes: ["user_id", "user_name", "user_email", "user_phone_number"],
        },
      ],
    });

    if (!row) return res.status(404).json({ message: "Offer not found" });

    res.status(200).json(row);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching offer",
      error: error.message,
    });
  }
};

/* =========================================================
   ✅ CHILD UPDATE: only same vendor can update (optional check)
   Body: { br_vendor_id, vendor_beading_amount, vendor_note }
========================================================= */
const vendorOfferUpdate = async (req, res) => {
  try {
    const { br_vendor_id, vendor_offer_status } = req.body;

    // 1️⃣ find offer
    const row = await BeadingRequestVendor.findByPk(br_vendor_id);
    if (!row) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // 2️⃣ prevent updating accepted offer
    if (row.vendor_offer_status === 1) {
      return res
        .status(400)
        .json({ message: "Accepted offer cannot be modified" });
    }

    // 3️⃣ validate status
    const statusNum = Number(vendor_offer_status);
    const allowedStatuses = [0, 1, 2, 3];
    // 0 = Offered
    // 1 = Accepted
    // 2 = Rejected
    // 3 = Cancelled

    if (!allowedStatuses.includes(statusNum)) {
      return res.status(400).json({ message: "Invalid vendor_offer_status" });
    }

    // 4️⃣ update only status
    await row.update({
      vendor_offer_status: statusNum,
    });

    return res.status(200).json({
      message: "Offer status updated successfully",
      data: row,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error updating offer status",
      error: error.message,
    });
  }
};
/* =========================================================
   ✅ CHILD DELETE: only same vendor can delete (optional check)
   Params: :br_vendor_id
========================================================= */
const vendorOfferDelete = async (req, res) => {
  try {
    const br_vendor_id = req.params.br_vendor_id;

    const row = await BeadingRequestVendor.findByPk(br_vendor_id);
    if (!row) return res.status(404).json({ message: "Offer not found" });

    // ✅ security: only owner vendor can delete
    if (Number(row.vendor_id) !== Number(req.currentUser.user_id)) {
      return res.status(403).json({ message: "You cannot delete this offer" });
    }

    if (row.vendor_offer_status === 1) {
      return res.status(400).json({ message: "Accepted offer cannot be deleted" });
    }

    await row.destroy();
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting offer",
      error: error.message,
    });
  }
};

/* =========================================================
   ✅ ACCEPT VENDOR (Customer accepts one vendor offer)
   Body: { beading_request_id, vendor_id }
   - set master accepted vendor
   - mark that vendor offer accepted
   - mark others rejected
========================================================= */
const vendorAccept = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { beading_request_id, vendor_id } = req.body;

    const requestRow = await BeadingRequest.findByPk(beading_request_id, { transaction: t });
    if (!requestRow) {
      await t.rollback();
      return res.status(404).json({ message: "Beading request not found" });
    }

    // ✅ Only owner customer can accept
    if (Number(requestRow.beading_customer_id) !== Number(req.currentUser.user_id)) {
      await t.rollback();
      return res.status(403).json({ message: "You cannot accept this request" });
    }

    // ✅ must exist offer from that vendor
    const offer = await BeadingRequestVendor.findOne({
      where: { beading_request_id, vendor_id },
      transaction: t,
    });

    if (!offer) {
      await t.rollback();
      return res.status(404).json({ message: "Vendor offer not found for this request" });
    }

    // update master
    await requestRow.update(
      {
        beading_vender_accepted_id: vendor_id,
        beading_request_status: 1, // accepted/in progress
      },
      { transaction: t }
    );

    // accept selected offer
    await offer.update(
      {
        vendor_offer_status: 1,
        accepted_at: new Date(),
      },
      { transaction: t }
    );

    // reject all others
    await BeadingRequestVendor.update(
      { vendor_offer_status: 2 },
      {
        where: {
          beading_request_id,
          vendor_id: { [sequelize.Sequelize.Op.ne]: vendor_id },
        },
        transaction: t,
      }
    );

    await t.commit();

    res.status(200).json({
      message: "Vendor accepted successfully",
      data: {
        beading_request_id,
        accepted_vendor_id: vendor_id,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Error accepting vendor",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  globalList,
  Get,
  update,
  deleted,

  // ✅ child CRUD
  vendorOfferUpsert,
  vendorOfferListByRequest,
  vendorOfferGet,
  vendorOfferUpdate,
  vendorOfferDelete,

  // ✅ accept flow
  vendorAccept,
};