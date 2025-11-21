const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tax = sequelize.define(
  "tbl_tax",
  {
    tax_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tax_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tax_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tax_created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tax_status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  
);


module.exports = Tax;
