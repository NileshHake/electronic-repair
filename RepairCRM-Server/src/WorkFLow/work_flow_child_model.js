const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const WorkflowChild = sequelize.define("tbl_workflow_child", {
  workflow_child_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  workflow_stage_created_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  workflow_master_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workflow_stage_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  workflow_stage_attachment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,  
  },
  workflow_stage_otp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,  
  },

  workflow_close_stage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workflow_stage_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  workflow_child_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = WorkflowChild;
