const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Brand = sequelize.define(
  "tbl_brand",
  {
    brand_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    brand_name: {
      type: DataTypes.STRING ,
      allowNull: false,
    },
     brand_created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    brand_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 = Active, 0 = Inactive
    },
  },
  
);

module.exports = Brand;
