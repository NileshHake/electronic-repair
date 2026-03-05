const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const InvoiceNumberGenerator = sequelize.define(
  "tbl_invoice_number_generator",
  {
    invoice_number_generator_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },



    invoice_number_generator_business_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    request_invoice_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    invoice_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    order_invoice_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    order_quotation_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    repair_invoice_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    repair_quotation_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    recovery_invoice_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    recovery_quotation_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    quotation_number_generator_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "tbl_invoice_number_generator",
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = InvoiceNumberGenerator;
