const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");

const AmcRequests = sequelize.define(
  "tbl_amc_requests",
  {
    request_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    request_status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
   
    
  },
  {
    timestamps: true,
    tableName: "tbl_amc_requests",
  }
);

module.exports = AmcRequests;