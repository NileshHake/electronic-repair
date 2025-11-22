const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const StageRemark = sequelize.define("tbl_stage_remark", {
  stage_remark_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  stage_remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stage_remark_img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stage_remark_video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stage_remark_repair_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage_remark_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stage_remark_change_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage_remark_stage_past_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage_remark_stage_next_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage_remark_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = StageRemark;
