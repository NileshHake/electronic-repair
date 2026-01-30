const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Requests = sequelize.define(
  "tbl_requests",
  {
    requests_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    requests_created_business_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    requests_created_supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    requests_created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    request_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    request_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    request_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,  
    },
  },
  {
    tableName: "tbl_requests",
  }
);

module.exports = Requests;
