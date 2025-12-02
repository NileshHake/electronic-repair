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
      repair_customer_id :req.currentUser.user_type == 6 ?req.currentUser.user_id : repair_customer_id,
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
    const { start_date, end_date, workflow_id, customer_search } = req.body || {};

    let whereClauses = [];
    const replacements = {};

    const userType = req.currentUser.user_type;
    const userId = req.currentUser.user_id;

    // ----------------- SPECIAL CASE: USER TYPE 6 (CUSTOMER) -----------------
    if (userType == 6) {
      // Only see their own repairs
      whereClauses.push("r.repair_customer_id = :user_id");
      replacements.user_id = userId;

      // Only allow workflow filter for customer
      if (workflow_id) {
        whereClauses.push("r.repair_workflow_id = :workflow_id");
        replacements.workflow_id = workflow_id;
      }

      // Build final WHERE
      let whereSQL = "";
      if (whereClauses.length > 0) {
        whereSQL = "WHERE " + whereClauses.join(" AND ");
      }

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
 cust.user_profile      AS customer_profile,
          -- =============== REFERRED BY CUSTOMER ===============
          ref.user_id                    AS referred_by_customer_id,
          ref.user_name                  AS referred_by_name,
          ref.user_phone_number          AS referred_by_phone_number,
          ref.user_email                 AS referred_by_email,
          ref.user_created_by            AS referred_by_created_by,
          ref.user_address_state         AS referred_by_address_state,
          ref.user_address_district      AS referred_by_address_district,
          ref.user_address_block         AS referred_by_address_block,
          ref.user_address_city          AS referred_by_address_city,
          ref.user_address_pincode       AS referred_by_pincode,
          ref.user_address_description   AS referred_by_address_description,
          ref.user_status                AS referred_by_status,

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
        LEFT JOIN tbl_users AS cust 
          ON r.repair_customer_id = cust.user_id
        LEFT JOIN tbl_users AS ref 
          ON r.repair_referred_by_id = ref.user_id
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
    }

    // ----------------- OTHER USER TYPES (1–5) -----------------
    // Access condition
    if (userType == 1 || userType == 2) {
      whereClauses.push("r.repair_created_by = :user_id");
      replacements.user_id = userId;
    } else if (userType == 3) {
      whereClauses.push("r.repair_created_by = :user_created_by");
      replacements.user_created_by = req.currentUser.user_created_by;
    } else if (userType == 4) {
      whereClauses.push("r.repair_assigned_technician_to = :user_id");
      replacements.user_id = userId;
    } else if (userType == 5) {
      whereClauses.push("r.repair_delivery_and_pickup_to = :user_id");
      replacements.user_id = userId;
    }

    // DATE FILTER (only for user types 1–5)
    if (start_date && end_date) {
      const start = new Date(start_date);
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

    // WORKFLOW FILTER (still allowed)
    if (workflow_id) {
      whereClauses.push("r.repair_workflow_id = :workflow_id");
      replacements.workflow_id = workflow_id;
    }

    // CUSTOMER SEARCH (only for internal users, not customers)
    if (customer_search && customer_search.trim() !== "") {
      whereClauses.push(
        "(cust.user_name LIKE :customer_search OR cust.user_phone_number LIKE :customer_search)"
      );
      replacements.customer_search = `%${customer_search.trim()}%`;
    }

    let whereSQL = "";
    if (whereClauses.length > 0) {
      whereSQL = "WHERE " + whereClauses.join(" AND ");
    }

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
        cust.user_profile      AS customer_profile,
        cust.user_address_description  AS customer_address_description,
        cust.user_status               AS customer_status,

        -- =============== REFERRED BY CUSTOMER ===============
        ref.user_id                    AS referred_by_customer_id,
        ref.user_name                  AS referred_by_name,
        ref.user_phone_number          AS referred_by_phone_number,
        ref.user_email                 AS referred_by_email,
        ref.user_created_by            AS referred_by_created_by,
        ref.user_address_state         AS referred_by_address_state,
        ref.user_address_district      AS referred_by_address_district,
        ref.user_address_block         AS referred_by_address_block,
        ref.user_address_city          AS referred_by_address_city,
        ref.user_address_pincode       AS referred_by_pincode,
        ref.user_address_description   AS referred_by_address_description,
        ref.user_status                AS referred_by_status,

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
      LEFT JOIN tbl_users AS cust 
        ON r.repair_customer_id = cust.user_id
      LEFT JOIN tbl_users AS ref 
        ON r.repair_referred_by_id = ref.user_id
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
 cust.user_profile      AS customer_profile,
        -- =============== REFERRED BY CUSTOMER ===============
        ref.user_id                    AS referred_by_customer_id,
        ref.user_name                  AS referred_by_name,
        ref.user_phone_number          AS referred_by_phone_number,
        ref.user_email                 AS referred_by_email,
        ref.user_created_by            AS referred_by_created_by,
        ref.user_address_state         AS referred_by_address_state,
        ref.user_address_district      AS referred_by_address_district,
        ref.user_address_block         AS referred_by_address_block,
        ref.user_address_city          AS referred_by_address_city,
        ref.user_address_pincode       AS referred_by_pincode,
        ref.user_address_description   AS referred_by_address_description,
        ref.user_status                AS referred_by_status,

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
      LEFT JOIN tbl_users AS cust 
        ON r.repair_customer_id = cust.user_id
      LEFT JOIN tbl_users AS ref 
        ON r.repair_referred_by_id = ref.user_id
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
