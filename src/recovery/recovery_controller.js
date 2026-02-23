const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const Recovery = require("./recovery_model");

// =========================
// STORE
// =========================
const store = async (req, res) => {
  try {
    const {
      recovery_estimated_cost,
      recovery_problem_description,
      recovery_received_date,
      recovery_workflow_id,
      recovery_workflow_stage_id,
      recovery_created_by,
      recovery_expected_delivery_date,
      recovery_assigned_technician_to,
      recovery_delivery_and_pickup_to,
      recovery_quotation_amt,
      recovery_bill_amt,
      recovery_status,
    } = req.body;

    // ✅ MULTIPLE IMAGES
    let recovery_images = [];
    if (req.files && req.files["recovery_image[]"]) {
      const images = req.files["recovery_image[]"];
      const fileArray = Array.isArray(images) ? images : [images];

      for (const file of fileArray) {
        const savedImage = await saveImage(file, "recovery_images");
        recovery_images.push(savedImage);
      }
    }

    const recoveryData = {
      recovery_customer_id: req.currentUser.user_id,
      recovery_problem_description,
      recovery_estimated_cost,
      recovery_received_date,
      recovery_expected_delivery_date,
      recovery_assigned_technician_to,
      recovery_delivery_and_pickup_to,
      recovery_workflow_id,
      recovery_workflow_stage_id,
      recovery_quotation_amt,
      recovery_bill_amt,
      recovery_status: recovery_status ?? 1,

      recovery_image: JSON.stringify(recovery_images),

      recovery_created_by: recovery_created_by,
    };

    const newRecovery = await Recovery.create(recoveryData);

    return res.status(201).json({
      message: "Recovery created successfully",
      data: newRecovery,
    });
  } catch (error) {
    console.error("Error creating recovery:", error);
    return res.status(500).json({
      message: "Error creating recovery",
      error: error.message,
    });
  }
};

// =========================
// LIST (INDEX) - WITH FILTERS + USER TYPE ACCESS
// =========================
const index = async (req, res) => {
  try {
    const { start_date, end_date, workflow_id, customer_search } = req.body || {};

    let whereClauses = [];
    const replacements = {};

    const userType = req.currentUser.user_type;
    const userId = req.currentUser.user_id;

    // ----------------- SPECIAL CASE: USER TYPE 6 (CUSTOMER) -----------------
    if (userType == 6) {
      whereClauses.push("r.recovery_customer_id = :user_id");
      replacements.user_id = userId;

      if (workflow_id) {
        whereClauses.push("r.recovery_workflow_id = :workflow_id");
        replacements.workflow_id = workflow_id;
      }

      let whereSQL = "";
      if (whereClauses.length > 0) whereSQL = "WHERE " + whereClauses.join(" AND ");

      const sql = `
        SELECT
          r.*,

          -- =============== CUSTOMER (MAIN) ===============
          cust.user_id                   AS customer_id,
          cust.user_name                 AS customer_name,
          cust.user_phone_number         AS customer_phone_number,
          cust.user_email                AS customer_email,
          cust.user_created_by           AS customer_created_by,
          cust.user_address_state        AS customer_address_state,
          cust.user_address_district     AS customer_address_district,
          cust.user_address_block        AS customer_address_block,
          cust.user_address_city         AS customer_address_city,
          cust.user_address_pincode      AS customer_address_pincode,
          cust.user_address_description  AS customer_address_description,
          cust.user_status               AS customer_status,
          cust.user_profile              AS customer_profile,

          -- =============== OTHER JOINS ===============
          tech.user_name AS technician_name,
          del.user_name AS delivery_boy_name,
          wf.*,
          wf_child.*

        FROM tbl_recoveries AS r
        LEFT JOIN tbl_users AS cust
          ON r.recovery_customer_id = cust.user_id
        LEFT JOIN tbl_users AS tech
          ON r.recovery_assigned_technician_to = tech.user_id
        LEFT JOIN tbl_users AS del
          ON r.recovery_delivery_and_pickup_to = del.user_id
        LEFT JOIN tbl_workflow_masters AS wf
          ON r.recovery_workflow_id = wf.workflow_id
        LEFT JOIN tbl_workflow_children AS wf_child
          ON r.recovery_workflow_stage_id = wf_child.workflow_child_id
        ${whereSQL}
        ORDER BY r.recovery_id ASC;
      `;

      const recoveries = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return res.status(200).json(recoveries);
    }

    // ----------------- OTHER USER TYPES (1–5) -----------------
    if (userType == 1 || userType == 2) {
      whereClauses.push("r.recovery_created_by = :user_id");
      replacements.user_id = userId;
    } else if (userType == 3) {
      whereClauses.push("r.recovery_created_by = :user_created_by");
      replacements.user_created_by = req.currentUser.user_created_by;
    } else if (userType == 4) {
      whereClauses.push("r.recovery_assigned_technician_to = :user_id");
      replacements.user_id = userId;
    } else if (userType == 5) {
      whereClauses.push("r.recovery_delivery_and_pickup_to = :user_id");
      replacements.user_id = userId;
    }

    // DATE FILTER
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);

      const startDay = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(start.getDate()).padStart(2, "0")} 00:00:00`;

      const endDay = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(end.getDate()).padStart(2, "0")} 23:59:59`;

      whereClauses.push("r.recovery_received_date BETWEEN :startDate AND :endDate");
      replacements.startDate = startDay;
      replacements.endDate = endDay;
    }

    // WORKFLOW FILTER
    if (workflow_id) {
      whereClauses.push("r.recovery_workflow_id = :workflow_id");
      replacements.workflow_id = workflow_id;
    }

    // CUSTOMER SEARCH
    if (customer_search && customer_search.trim() !== "") {
      whereClauses.push(
        "(cust.user_name LIKE :customer_search OR cust.user_phone_number LIKE :customer_search)"
      );
      replacements.customer_search = `%${customer_search.trim()}%`;
    }

    let whereSQL = "";
    if (whereClauses.length > 0) whereSQL = "WHERE " + whereClauses.join(" AND ");

    const sql = `
      SELECT
        r.*,

        -- =============== CUSTOMER (MAIN) ===============
        cust.user_id                   AS customer_id,
        cust.user_name                 AS customer_name,
        cust.user_phone_number         AS customer_phone_number,
        cust.user_email                AS customer_email,
        cust.user_created_by           AS customer_created_by,
        cust.user_address_state        AS customer_address_state,
        cust.user_address_district     AS customer_address_district,
        cust.user_address_block        AS customer_address_block,
        cust.user_address_city         AS customer_address_city,
        cust.user_address_pincode      AS customer_address_pincode,
        cust.user_address_description  AS customer_address_description,
        cust.user_status               AS customer_status,
        cust.user_profile              AS customer_profile,

        -- =============== OTHER JOINS ===============
        tech.user_name AS technician_name,
        del.user_name AS delivery_boy_name,
        wf.*,
        wf_child.*

      FROM tbl_recoveries AS r
      LEFT JOIN tbl_users AS cust
        ON r.recovery_customer_id = cust.user_id
      LEFT JOIN tbl_users AS tech
        ON r.recovery_assigned_technician_to = tech.user_id
      LEFT JOIN tbl_users AS del
        ON r.recovery_delivery_and_pickup_to = del.user_id
      LEFT JOIN tbl_workflow_masters AS wf
        ON r.recovery_workflow_id = wf.workflow_id
      LEFT JOIN tbl_workflow_children AS wf_child
        ON r.recovery_workflow_stage_id = wf_child.workflow_child_id
      ${whereSQL}
      ORDER BY r.recovery_id ASC;
    `;

    const recoveries = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(recoveries);
  } catch (error) {
    console.error("Error fetching recoveries:", error);
    return res.status(500).json({
      message: "Error fetching recoveries",
      error: error.message,
    });
  }
};

// =========================
// LIST FOR CUSTOMER ONLY
// =========================
const indexCustomerOnly = async (req, res) => {
  try {
    const userId = req.currentUser.user_id;

    const sql = `
      SELECT
        r.*,

        -- ================= CUSTOMER =================
        cust.user_id           AS customer_id,
        cust.user_name         AS customer_name,
        cust.user_phone_number AS customer_phone_number,
        cust.user_email        AS customer_email,
        cust.user_profile      AS customer_profile,

        -- ================= VENDOR =================
        vendor.user_id         AS vendor_id,
        vendor.user_name       AS vendor_name,

        -- ================= TECHNICIAN =================
        tech.user_id           AS technician_id,
        tech.user_name         AS technician_name,

        -- ================= DELIVERY =================
        del.user_id            AS delivery_id,
        del.user_name          AS delivery_boy_name,

        -- ================= WORKFLOW =================
        wf.workflow_name,
        wf.workflow_status,

        -- ================= WORKFLOW STAGE =================
        wf_child.workflow_stage_name,
        wf_child.workflow_stage_color

      FROM tbl_recoveries AS r

      LEFT JOIN tbl_users AS cust
        ON r.recovery_customer_id = cust.user_id

      -- Vendor (user_type = 5)
      LEFT JOIN tbl_users AS vendor
        ON r.recovery_created_by = vendor.user_id
        AND vendor.user_type = 5

      -- Technician (user_type = 3)
      LEFT JOIN tbl_users AS tech
        ON r.recovery_assigned_technician_to = tech.user_id
        AND tech.user_type = 3

      -- Delivery (user_type = 4)
      LEFT JOIN tbl_users AS del
        ON r.recovery_delivery_and_pickup_to = del.user_id
        AND del.user_type = 4

      LEFT JOIN tbl_workflow_masters AS wf
        ON r.recovery_workflow_id = wf.workflow_id

      LEFT JOIN tbl_workflow_children AS wf_child
        ON r.recovery_workflow_stage_id = wf_child.workflow_child_id

      WHERE r.recovery_customer_id = :userId

      ORDER BY r.recovery_id ASC;
    `;


    const recoveries = await sequelize.query(sql, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(recoveries);
  } catch (error) {
    console.error("Error fetching customer recoveries:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// GET SINGLE
// =========================
const Get = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await sequelize.query(
      `
      SELECT
        r.*,

        cust.user_id                   AS customer_id,
        cust.user_name                 AS customer_name,
        cust.user_phone_number         AS customer_phone_number,
        cust.user_email                AS customer_email,
        cust.user_profile              AS customer_profile,

        tech.user_name AS technician_name,
        del.user_name AS delivery_boy_name,
        wf.*,
        wf_child.*

      FROM tbl_recoveries AS r
      LEFT JOIN tbl_users AS cust
        ON r.recovery_customer_id = cust.user_id
      LEFT JOIN tbl_users AS tech
        ON r.recovery_assigned_technician_to = tech.user_id
      LEFT JOIN tbl_users AS del
        ON r.recovery_delivery_and_pickup_to = del.user_id
      LEFT JOIN tbl_workflow_masters AS wf
        ON r.recovery_workflow_id = wf.workflow_id
      LEFT JOIN tbl_workflow_children AS wf_child
        ON r.recovery_workflow_stage_id = wf_child.workflow_child_id

      WHERE r.recovery_id = :id;
      `,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Recovery record not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching recovery:", error);
    return res.status(500).json({
      message: "Error fetching recovery record",
      error: error.message,
    });
  }
};

// =========================
// UPDATE
// =========================
const update = async (req, res) => {
  try {
    const {
      recovery_id,
      recovery_customer_id,
      recovery_problem_description,
      recovery_estimated_cost,
      recovery_received_date,
      recovery_expected_delivery_date,
      recovery_assigned_technician_to,
      recovery_delivery_and_pickup_to,
      recovery_workflow_id,
      recovery_workflow_stage_id,
      recovery_quotation_amt,
      recovery_bill_amt,
      recovery_status,
    } = req.body;

    if (!recovery_id) {
      return res.status(400).json({ message: "Missing recovery_id" });
    }

    const recovery = await Recovery.findByPk(recovery_id);
    if (!recovery) {
      return res.status(404).json({ message: "Recovery not found" });
    }

    // ✅ old images in DB (JSON)
    let oldImagesInDB = [];
    try {
      oldImagesInDB = JSON.parse(recovery.recovery_image || "[]");
      if (!Array.isArray(oldImagesInDB)) oldImagesInDB = [];
    } catch {
      oldImagesInDB = [];
    }

    // ✅ images user wants to keep
    const keptOldImages = Array.isArray(req.body["old_images[]"])
      ? req.body["old_images[]"]
      : req.body["old_images[]"]
        ? [req.body["old_images[]"]]
        : [];

    // ✅ delete removed images from folder
    const removedImages = oldImagesInDB.filter((img) => !keptOldImages.includes(img));
    for (const img of removedImages) {
      await deleteImage("recovery_images", img);
    }

    // ✅ new uploaded images
    let newUploadedImages = [];
    if (req.files && req.files["recovery_image[]"]) {
      const files = Array.isArray(req.files["recovery_image[]"])
        ? req.files["recovery_image[]"]
        : [req.files["recovery_image[]"]];

      for (const file of files) {
        const savedName = await saveImage(file, "recovery_images");
        newUploadedImages.push(savedName);
      }
    }

    const finalImages = [...keptOldImages, ...newUploadedImages];

    await recovery.update({
      recovery_customer_id,
      recovery_problem_description,
      recovery_estimated_cost,
      recovery_received_date,
      recovery_expected_delivery_date,
      recovery_assigned_technician_to,
      recovery_delivery_and_pickup_to,
      recovery_workflow_id,
      recovery_workflow_stage_id,
      recovery_quotation_amt,
      recovery_bill_amt,
      recovery_status,

      recovery_image: JSON.stringify(finalImages),
    });

    return res.status(200).json({
      message: "✅ Recovery updated successfully",
      data: recovery,
    });
  } catch (error) {
    console.error("❌ Error updating recovery:", error);
    return res.status(500).json({
      message: "Error updating recovery",
      error: error.message,
    });
  }
};

// =========================
// DELETE
// =========================
const deleted = async (req, res) => {
  try {
    const recovery = await Recovery.findByPk(req.params.id);
    if (!recovery) return res.status(404).json({ message: "Recovery record not found" });

    // ✅ delete all images if present
    let imgs = [];
    try {
      imgs = JSON.parse(recovery.recovery_image || "[]");
      if (!Array.isArray(imgs)) imgs = [];
    } catch {
      imgs = [];
    }

    for (const img of imgs) {
      await deleteImage("recovery_images", img);
    }

    await recovery.destroy();

    return res.status(200).json({ message: "Recovery deleted successfully" });
  } catch (error) {
    console.error("Error deleting recovery:", error);
    return res.status(500).json({
      message: "Error deleting recovery",
      error: error.message,
    });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
  indexCustomerOnly,
};
