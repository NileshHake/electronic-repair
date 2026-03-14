const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const AMCQuotations = sequelize.define(
  "tbl_amc_quotations",
  {
    quotation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customer_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quotation_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    base_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    gst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 18.0,
    },

    gst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    duration_months: {
      type: DataTypes.INTEGER,
    },

    service_visits: {
      type: DataTypes.INTEGER,
    },

    coverage_type: {
      type: DataTypes.STRING,
    },

    quotation_status: {
      type: DataTypes.STRING,
      defaultValue: "sent",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "tbl_amc_quotations",
    timestamps: true,
  }
);

module.exports = AMCQuotations;