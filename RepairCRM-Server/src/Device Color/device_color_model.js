const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const DeviceColor = sequelize.define("tbl_device_color", {
  device_color_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  device_color_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  device_color_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   
});

module.exports = DeviceColor;
