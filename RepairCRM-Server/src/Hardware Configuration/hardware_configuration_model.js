const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const HardwareConfiguration = sequelize.define("tbl_hardware_configuration", {
  hardware_configuration_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  hardware_configuration_processor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hardware_configuration_ram: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hardware_configuration_hard_disk: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hardware_configuration_ssd: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hardware_configuration_graphics_card: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  hardware_configuration_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = HardwareConfiguration;
