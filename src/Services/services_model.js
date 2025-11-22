const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Services = sequelize.define("tbl_services", {
  service_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  service_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  service_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Services;
