const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const AmcContracts = sequelize.define("tbl_amc_contracts", {
  contract_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  start_date: {
    type: DataTypes.DATEONLY,
  },

  end_date: {
    type: DataTypes.DATEONLY,
  },

  total_visits: {
    type: DataTypes.INTEGER,
  },

  remaining_visits: {
    type: DataTypes.INTEGER,
  },
  duration_months: {
    type: DataTypes.INTEGER,
  },
  contract_status: {
    type: DataTypes.ENUM("active", "expired", "cancelled"),
    defaultValue: "active",
  },

  created_by: {
    type: DataTypes.INTEGER,
  },
});

module.exports = AmcContracts;