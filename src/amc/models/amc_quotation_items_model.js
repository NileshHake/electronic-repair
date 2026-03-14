const { DataTypes } = require("sequelize");

const sequelize = require("../../../config/db");

const AMCQuotationItems = sequelize.define(
  "tbl_amc_quotation_items",
  {
    item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING,
    },
    problem_note: {
      type: DataTypes.STRING,
    },

    qty: {
      type: DataTypes.INTEGER,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "tbl_amc_quotation_items",
    timestamps: true,
  }
);

module.exports = AMCQuotationItems;