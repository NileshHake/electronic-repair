const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const WorkflowMaster = sequelize.define("tbl_workflow_master", {
  workflow_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  workflow_create_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workflow_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  workflow_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = WorkflowMaster;
