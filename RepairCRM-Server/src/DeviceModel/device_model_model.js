const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const DeviceModel = sequelize.define("tbl_device_model", {
  device_model_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  device_model_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  device_model_brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device_model_device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device_model_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = DeviceModel;
