const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const StorageLocation = sequelize.define("tbl_storage_location", {
  storage_location_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  storage_location_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storage_location_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = StorageLocation;
