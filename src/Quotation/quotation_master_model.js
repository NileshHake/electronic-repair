const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const QuotationMaster = sequelize.define(
  "tbl_quotation_master",
  {
    quotation_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    quotation_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    business_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    create_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    expire_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    grand_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    total_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    quotation_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1=draft, 2=final, 3=cancelled
    },

    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "tbl_quotation_master",
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = QuotationMaster;
