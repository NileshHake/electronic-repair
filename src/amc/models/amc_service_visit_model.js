const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const AmcServiceVisits = sequelize.define("tbl_amc_service_visits", {
  visit_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  contract_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  technician_id: {
    type: DataTypes.INTEGER,
  },

  visit_date: {
    type: DataTypes.DATEONLY,
  },

  visit_status: {
    type: DataTypes.ENUM("scheduled", "completed", "rescheduled"),
    defaultValue: "scheduled",
  },

  service_report: {
    type: DataTypes.TEXT,
  },

  created_by: {
    type: DataTypes.INTEGER,
  },
});

module.exports = AmcServiceVisits;