const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { getCreatedBy } = require("../helper/CurrentUser");
const { saveImage, saveVideo } = require("../helper/fileUpload");
const Repair = require("../Repair/repair_model");
const StageRemark = require("./stage_change_remark_model");

// 🟢 CREATE
const store = async (req, res) => {
  try {
    const createdBy = getCreatedBy(req.currentUser);

    /* --------- HANDLE IMAGES (MULTIPLE) ---------- */
    let imageNames = [];

    if (req.files) {
      // Support both: stage_remark_img and stage_remark_img[]
      let images =
        req.files.stage_remark_img || req.files["stage_remark_img[]"] || null;

      if (images) {
        if (!Array.isArray(images)) {
          images = [images];
        }

        for (const imgFile of images) {
          const savedName = await saveImage(imgFile, "stage_remark_img");
          imageNames.push(savedName);
        }
      }
    }

    /* --------- HANDLE VIDEO (SINGLE) ---------- */
    let videoName = "";
    if (req.files && req.files.stage_remark_video) {
      const videoFile = req.files.stage_remark_video;
      videoName = await saveVideo(videoFile, "stage_remark_video");
    }

    /* --------- CREATE STAGE REMARK ---------- */
    const {
      stage_remark_repair_id,
      stage_remark_stage_next_id,
      // any other body fields...
    } = req.body;

    const payload = {
      ...req.body,
      stage_remark_created_by: createdBy,
      stage_remark_change_by_id: req.currentUser.user_id,
      stage_remark_img: imageNames.length ? JSON.stringify(imageNames) : null,
      stage_remark_video: videoName || null,
    };

    const stageRemark = await StageRemark.create(payload);

    /* --------- UPDATE REPAIR STAGE ---------- */
    if (stageRemark && stage_remark_repair_id && stage_remark_stage_next_id) {
      const repair = await Repair.findByPk(stage_remark_repair_id);

      if (repair) {
        // update field on the instance
        repair.repair_workflow_stage_id = stage_remark_stage_next_id;
        await repair.save();
      } else {
        console.warn(
          "Repair not found for stage_remark_repair_id:",
          stage_remark_repair_id
        );
      }
    }

    return res.status(201).json({
      message: "Stage remark created successfully",
      data: stageRemark,
    });
  } catch (error) {
    console.error("Error creating stage remark:", error);
    return res.status(500).json({
      message: "Error creating stage remark",
      error: error.message,
    });
  }
};

// 🟡 READ ALL
const index = async (req, res) => {
  try {
    const stageRemarks = await StageRemark.findAll({
      where: {
        stage_remark_created_by: getCreatedBy(req.currentUser),
      },
      order: [["stage_remark_id", "DESC"]],
    });
    res.status(200).json(stageRemarks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stage remarks", error: error.message });
  }
};

// 🔵 READ SINGLE
const Get = async (req, res) => {
  try {
    const { id } = req.params;

    const stageRemarks = await sequelize.query(
      `
      SELECT 
        sr.*,

        -- CURRENT STAGE NAME
        curStage.workflow_stage_name  AS current_workflow_stage_name,

        -- NEXT / MOVED STAGE NAME
        nextStage.workflow_stage_name AS next_workflow_stage_name,

        -- USER WHO CHANGED STAGE
        u.user_name    AS changed_by_user_name,
        u.user_profile AS changed_by_user_profile

      FROM tbl_stage_remarks AS sr
      LEFT JOIN tbl_workflow_children AS curStage
        ON sr.stage_remark_stage_past_id = curStage.workflow_child_id
      LEFT JOIN tbl_workflow_children AS nextStage
        ON sr.stage_remark_stage_next_id = nextStage.workflow_child_id
      LEFT JOIN tbl_users AS u
        ON sr.stage_remark_change_by_id = u.user_id
      WHERE sr.stage_remark_repair_id = :id
      ORDER BY sr.stage_remark_id DESC;
      `,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!stageRemarks || stageRemarks.length === 0) {
      return res.status(404).json({ message: "Stage remark not found" });
    }

    res.status(200).json(stageRemarks);
  } catch (error) {
    console.error("Error fetching stage remark:", error);
    res.status(500).json({
      message: "Error fetching stage remark",
      error: error.message,
    });
  }
};
// 🟠 UPDATE
const update = async (req, res) => {
  try {
    const stageRemark = await StageRemark.findByPk(req.body.stage_remark_id);

    if (!stageRemark)
      return res.status(404).json({ message: "Stage remark not found" });

    await stageRemark.update(req.body);
    res.status(200).json({
      message: "Stage remark updated successfully",
      data: stageRemark,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating stage remark", error: error.message });
  }
};

// 🔴 DELETE
const deleted = async (req, res) => {
  try {
    const deleted = await StageRemark.destroy({
      where: { stage_remark_id: req.params.id },
    });

    if (!deleted)
      return res.status(404).json({ message: "Stage remark not found" });

    res.status(200).json({ message: "Stage remark deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting stage remark", error: error.message });
  }
};

module.exports = {
  store,
  index,
  Get,
  update,
  deleted,
};
