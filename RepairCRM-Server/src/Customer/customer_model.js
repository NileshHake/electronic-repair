const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Customer = sequelize.define("tbl_customer", {
  customer_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_address_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_address_district: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  customer_address_block: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_address_city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_address_pincode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customer_address_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = Customer;
