const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const QuotationItem = sequelize.define(
  "tbl_quotation_items",
  {
    quotation_item_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    quotation_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "tbl_quotation_items",
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = QuotationItem;
