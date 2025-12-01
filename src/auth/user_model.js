const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = sequelize.define("tbl_user", {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  user_upi_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_gst_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_bank_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_branch_nmae: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_bank_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  user_bank_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  user_bank_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_bank_account_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_address_pincode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_address_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_address_district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_address_block: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_address_city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_address_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  user_terms_and_conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  user_profile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = User;
