const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, deleteImage } = require("../helper/fileUpload");
const Repair = require("./repair_model");
const moment = require("moment");

const store = async (req, res) => {
  try {
    const {
      repair_customer_id,
      repair_product_id,
      repair_problem_description,
      repair_estimated_cost,
      repair_received_date,
      repair_workflow_id,
      repair_workflow_stage_id,
      repair_device_hardware_configuration_id,
      repair_referred_by_id,
      repair_source_id,
      repair_type_id,
      repair_service_type_id,
      repair_device_type_id,
      repair_device_brand_id,
      repair_device_model_id,
      repair_device_storage_location_id,
      repair_device_color_id,
      repair_device_serial_number,
      repair_device_password,
      repair_device_accessories_id,
      repair_device_services_id,
      repair_device_priority,
      repair_expected_delivery_date,
      repair_assigned_technician_to,
      repair_delivery_and_pickup_to,
    } = req.body;

    let repair_images = [];

    if (req.files && req.files["repair_image[]"]) {
      const images = req.files["repair_image[]"];

      const fileArray = Array.isArray(images) ? images : [images];

      for (const file of fileArray) {
        const savedImage = await saveImage(file, "repair_images");
        repair_images.push(savedImage);
      }
    }

    const repairData = {
      repair_customer_id,
      repair_product_id,
      repair_problem_description,
      repair_estimated_cost,
      repair_received_date,
      repair_workflow_id,
      repair_workflow_stage_id,
      repair_device_hardware_configuration_id,
      repair_referred_by_id,
      repair_source_id,
      repair_type_id,
      repair_service_type_id,
      repair_device_type_id,
      repair_device_brand_id,
      repair_device_model_id,
      repair_device_storage_location_id,
      repair_device_color_id,
      repair_device_serial_number,
      repair_device_password,
      repair_device_accessories_id,
      repair_device_services_id,
      repair_device_priority,
      repair_expected_delivery_date,  
      repair_assigned_technician_to,
      repair_delivery_and_pickup_to,
      repair_image: JSON.stringify(repair_images),
      repair_created_by: getCreatedBy(req.currentUser),
    };

    const newRepair = await Repair.create(repairData);

    res.status(201).json({
      message: "Repair inquiry created successfully",
      data: newRepair,
    });
  } catch (error) {
    console.error("Error creating repair:", error);
    res.status(500).json({
      message: "Error creating repair inquiry",
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const { start_date, end_date, workflow_id, customer_search } =
      req.body || {};

    let whereClauses = [];
    const replacements = {};

    // ----------------- ACCESS CONDITION (BY USER TYPE) -----------------
    if (req.currentUser.user_type == 1 || req.currentUser.user_type == 2) {
      // Super Admin / Admin – only their own repairs
      whereClauses.push("r.repair_created_by = :user_id");
      replacements.user_id = req.currentUser.user_id;
    } else if (req.currentUser.user_type == 3) {
      // Employee – all repairs created by their creator (boss)
      whereClauses.push("r.repair_created_by = :user_created_by");
      replacements.user_created_by = req.currentUser.user_created_by;
    } else if (req.currentUser.user_type == 4) {
      // Technician – only assigned to them
      whereClauses.push("r.repair_assigned_technician_to = :user_id");
      replacements.user_id = req.currentUser.user_id;
    } else if (req.currentUser.user_type == 5) {
      // Delivery boy – only assigned to them
      whereClauses.push("r.repair_delivery_and_pickup_to = :user_id");
      replacements.user_id = req.currentUser.user_id;
    }

    // ----------------- DATE FILTER (18/11/2025 22:47 FORMAT) -----------------
    if (start_date && end_date) {
      // Convert to full day range
      const start = new Date(start_date); // 2025-11-19T17:26:32.408Z
      const end = new Date(end_date);

      const startDay = `${start.getFullYear()}-${String(
        start.getMonth() + 1
      ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")} 00:00:00`;

      const endDay = `${end.getFullYear()}-${String(
        end.getMonth() + 1
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")} 23:59:59`;

      whereClauses.push(
        "r.repair_received_date BETWEEN :startDate AND :endDate"
      );
      replacements.startDate = startDay;
      replacements.endDate = endDay;
    }

    // ----------------- WORKFLOW FILTER -----------------
    if (workflow_id) {
      whereClauses.push("r.repair_workflow_id = :workflow_id");
      replacements.workflow_id = workflow_id;
    }

    // ----------------- CUSTOMER SEARCH (NAME OR MOBILE) -----------------
    if (customer_search && customer_search.trim() !== "") {
      // For partial match use LIKE
      whereClauses.push(
        "(cust.customer_name LIKE :customer_search OR cust.customer_phone_number LIKE :customer_search)"
      );
      replacements.customer_search = `%${customer_search.trim()}%`;
    }

    // ----------------- FINAL WHERE STRING -----------------
    let whereSQL = "";
    if (whereClauses.length > 0) {
      whereSQL = "WHERE " + whereClauses.join(" AND ");
    }

    // ----------------- MAIN QUERY -----------------
    const sql = `
      SELECT 
        r.*,

        -- =============== CUSTOMER (MAIN) ===============
        cust.customer_id                   AS customer_id,
        cust.customer_name                 AS customer_name,
        cust.customer_phone_number         AS customer_phone_number,
        cust.customer_email                AS customer_email,
        cust.customer_created_by           AS customer_created_by,
        cust.customer_address_state        AS customer_address_state,
        cust.customer_address_district     AS customer_address_district,
        cust.customer_address_block        AS customer_address_block,
        cust.customer_address_city         AS customer_address_city,
        cust.customer_address_pincode      AS customer_address_pincode,
        cust.customer_address_description  AS customer_address_description,
        cust.customer_status               AS customer_status,

        -- =============== REFERRED BY CUSTOMER ===============
        ref.customer_id                    AS referred_by_customer_id,
        ref.customer_name                  AS referred_by_name,
        ref.customer_phone_number          AS referred_by_phone_number,
        ref.customer_email                 AS referred_by_email,
        ref.customer_created_by            AS referred_by_created_by,
        ref.customer_address_state         AS referred_by_address_state,
        ref.customer_address_district      AS referred_by_address_district,
        ref.customer_address_block         AS referred_by_address_block,
        ref.customer_address_city          AS referred_by_address_city,
        ref.customer_address_pincode       AS referred_by_pincode,
        ref.customer_address_description   AS referred_by_address_description,
        ref.customer_status                AS referred_by_status,

        -- =============== OTHER JOINS ===============
        tech.user_name AS technician_name,
        del.user_name AS delivery_boy_name,
        wf.*, 
        wf_child.*, 
        src.*, 
        srv.*, 
        rtype.*, 
        dtype.*, 
        br.*, 
        model.*, 
        store.*, 
        color.*, 
        hw.*

      FROM tbl_repairs AS r
      LEFT JOIN tbl_customers AS cust 
        ON r.repair_customer_id = cust.customer_id
      LEFT JOIN tbl_customers AS ref 
        ON r.repair_referred_by_id = ref.customer_id
      LEFT JOIN tbl_users AS tech
        ON r.repair_assigned_technician_to = tech.user_id
      LEFT JOIN tbl_users AS del
        ON r.repair_delivery_and_pickup_to = del.user_id
      LEFT JOIN tbl_workflow_masters AS wf
        ON r.repair_workflow_id = wf.workflow_id
      LEFT JOIN tbl_workflow_children AS wf_child
        ON r.repair_workflow_stage_id = wf_child.workflow_child_id
      LEFT JOIN tbl_sources AS src
        ON r.repair_source_id = src.source_id
      LEFT JOIN tbl_services_types AS srv
        ON r.repair_service_type_id = srv.service_type_id
      LEFT JOIN tbl_repair_types AS rtype
        ON r.repair_type_id = rtype.repair_type_id
      LEFT JOIN tbl_device_types AS dtype
        ON r.repair_device_type_id = dtype.device_type_id
      LEFT JOIN tbl_brands AS br
        ON r.repair_device_brand_id = br.brand_id
      LEFT JOIN tbl_device_models AS model
        ON r.repair_device_model_id = model.device_model_id
      LEFT JOIN tbl_storage_locations AS store
        ON r.repair_device_storage_location_id = store.storage_location_id
      LEFT JOIN tbl_device_colors AS color
        ON r.repair_device_color_id = color.device_color_id
      LEFT JOIN tbl_hardware_configurations AS hw
        ON r.repair_device_hardware_configuration_id = hw.hardware_configuration_id
      ${whereSQL}
      ORDER BY r.repair_id DESC;
    `;

    const repairs = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(repairs);
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return res.status(500).json({
      message: "Error fetching repairs",
      error: error.message,
    });
  }
};

const Get = async (req, res) => {
  try {
    const { id } = req.params;

    const repairs = await sequelize.query(
      `
      SELECT 
    r.*,

    -- ================= CUSTOMER (MAIN) =================
    cust.customer_id                   AS customer_id,
    cust.customer_name                 AS customer_name,
    cust.customer_phone_number         AS customer_phone_number,
    cust.customer_email                AS customer_email,
    cust.customer_created_by           AS customer_created_by,
    cust.customer_address_state        AS customer_address_state,
    cust.customer_address_district     AS customer_address_district,
    cust.customer_address_block        AS customer_address_block,
    cust.customer_address_city         AS customer_address_city,
    cust.customer_address_pincode      AS customer_address_pincode,
    cust.customer_address_description  AS customer_address_description,
    cust.customer_status               AS customer_status,

    -- ================= REFERRED BY CUSTOMER =================
    ref.customer_id                    AS referred_by_customer_id,
    ref.customer_name                  AS referred_by_name,
    ref.customer_phone_number          AS referred_by_phone_number,
    ref.customer_email                 AS referred_by_email,
    ref.customer_created_by            AS referred_by_created_by,
    ref.customer_address_state         AS referred_by_address_state,
    ref.customer_address_district      AS referred_by_address_district,
    ref.customer_address_block         AS referred_by_address_block,
    ref.customer_address_city          AS referred_by_address_city,
    ref.customer_address_pincode       AS referred_by_address_pincode,
    ref.customer_address_description   AS referred_by_address_description,
    ref.customer_status                AS referred_by_status,

    -- ================= OTHER JOINS (UNCHANGED) =================
    tech.user_name AS technician_name,
    del.user_name AS delivery_boy_name,
    wf.*, 
    wf_child.*, 
    src.*, 
    srv.*, 
    rtype.*, 
    dtype.*, 
    br.*, 
    model.*, 
    store.*, 
    color.*, 
    hw.*

  FROM tbl_repairs AS r
  LEFT JOIN tbl_customers AS cust 
    ON r.repair_customer_id = cust.customer_id
  LEFT JOIN tbl_customers AS ref 
    ON r.repair_referred_by_id = ref.customer_id
  LEFT JOIN tbl_users AS tech
    ON r.repair_assigned_technician_to = tech.user_id
  LEFT JOIN tbl_users AS del
    ON r.repair_delivery_and_pickup_to = del.user_id
  LEFT JOIN tbl_workflow_masters AS wf
    ON r.repair_workflow_id = wf.workflow_id
  LEFT JOIN tbl_workflow_children AS wf_child
    ON r.repair_workflow_stage_id = wf_child.workflow_child_id
  LEFT JOIN tbl_sources AS src
    ON r.repair_source_id = src.source_id
  LEFT JOIN tbl_services_types AS srv
    ON r.repair_service_type_id = srv.service_type_id
  LEFT JOIN tbl_repair_types AS rtype
    ON r.repair_type_id = rtype.repair_type_id
  LEFT JOIN tbl_device_types AS dtype
    ON r.repair_device_type_id = dtype.device_type_id
  LEFT JOIN tbl_brands AS br
    ON r.repair_device_brand_id = br.brand_id
  LEFT JOIN tbl_device_models AS model
    ON r.repair_device_model_id = model.device_model_id
  LEFT JOIN tbl_storage_locations AS store
    ON r.repair_device_storage_location_id = store.storage_location_id
  LEFT JOIN tbl_device_colors AS color
    ON r.repair_device_color_id = color.device_color_id
  LEFT JOIN tbl_hardware_configurations AS hw
    ON r.repair_device_hardware_configuration_id = hw.hardware_configuration_id
  WHERE r.repair_id = :id;
    `,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );
    if (!repairs || repairs.length === 0) {
      return res.status(404).json({ message: "Repair record not found" });
    }

    return res.status(200).json(repairs[0]);
  } catch (error) {
    console.error("Error fetching repair:", error);
    return res.status(500).json({
      message: "Error fetching repair record",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const {
      repair_id,
      repair_customer_id,
      repair_product_id,
      repair_problem_description,
      repair_estimated_cost,
      repair_received_date,
      repair_workflow_id,
      repair_workflow_stage_id,
      repair_device_hardware_configuration_id,
      repair_source_id,
      repair_type_id,
      repair_referred_by_id,
      repair_service_type_id,
      repair_device_type_id,
      repair_device_brand_id,
      repair_device_model_id,
      repair_device_storage_location_id,
      repair_device_color_id,
      repair_device_serial_number,
      repair_device_password,
      repair_device_accessories_id,
      repair_device_services_id,
      repair_device_priority,
      repair_expected_delivery_date,
      repair_assigned_technician_to,
      repair_delivery_and_pickup_to,
    } = req.body;

    if (!repair_id) {
      return res.status(400).json({ message: "Missing repair_id" });
    }

    const repair = await Repair.findByPk(repair_id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    let oldImagesInDB = [];
    try {
      oldImagesInDB = JSON.parse(repair.repair_image || "[]");
    } catch {
      oldImagesInDB = [];
    }

    const keptOldImages = Array.isArray(req.body["old_images[]"])
      ? req.body["old_images[]"]
      : req.body["old_images[]"]
      ? [req.body["old_images[]"]]
      : [];

    const removedImages = oldImagesInDB.filter(
      (img) => !keptOldImages.includes(img)
    );

    for (const img of removedImages) {
      await deleteImage("repair_images", img);
    }

    let newUploadedImages = [];
    if (req.files && req.files["repair_images[]"]) {
      const files = Array.isArray(req.files["repair_images[]"])
        ? req.files["repair_images[]"]
        : [req.files["repair_images[]"]];

      for (const file of files) {
        const savedName = await saveImage(file, "repair_images");
        newUploadedImages.push(savedName);
      }
    }

    const finalImages = [...keptOldImages, ...newUploadedImages];
    const servicesArray = (
      Array.isArray(repair_device_services_id)
        ? repair_device_services_id
        : [repair_device_services_id]
    ).map((s) => {
      if (typeof s === "string") return JSON.parse(s);
      return s;
    });

    await repair.update({
      repair_customer_id,
      repair_product_id,
      repair_problem_description,
      repair_estimated_cost,
      repair_received_date,
      repair_workflow_id,
      repair_workflow_stage_id,
      repair_device_hardware_configuration_id,
      repair_referred_by_id,
      repair_source_id,
      repair_type_id,
      repair_service_type_id,
      repair_device_type_id,
      repair_device_brand_id,
      repair_device_model_id,
      repair_device_storage_location_id,
      repair_device_color_id,
      repair_device_serial_number,
      repair_device_password,
      repair_device_accessories_id,
      repair_device_services_id: JSON.stringify(servicesArray),
      repair_device_priority,
      repair_expected_delivery_date,
      repair_assigned_technician_to,
      repair_delivery_and_pickup_to,
      repair_image: JSON.stringify(finalImages),
    });

    return res.status(200).json({
      message: "✅ Repair updated successfully",
      data: repair,
    });
  } catch (error) {
    console.error("❌ Error updating repair:", error);
    return res.status(500).json({
      message: "Error updating repair",
      error: error.message,
    });
  }
};

const deleted = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair)
      return res.status(404).json({ message: "Repair record not found" });

    if (repair.repair_image) {
      await deleteImage("repair_images", repair.repair_image);
    }

    await repair.destroy();

    res.status(200).json({ message: "Repair inquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting repair:", error);
    res.status(500).json({
      message: "Error deleting repair inquiry",
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
};
