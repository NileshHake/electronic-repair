const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Category = sequelize.define("tbl_category", {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },  
  category_status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

module.exports = Category;
