const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");
 

const AMCRequestItems = sequelize.define(
  "tbl_amc_request_items",
  {
    item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    problem_note: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "tbl_amc_request_items",
    timestamps: true,
  }
);  

module.exports = AMCRequestItems;