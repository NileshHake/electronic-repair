const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const DeviceType = sequelize.define("tbl_device_type", {
  device_type_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  device_type_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  carry_price_per_month: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  onsite_price_per_month: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  carry_price_per_year: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  onsite_price_per_year: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  device_type_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

});

module.exports = DeviceType;
