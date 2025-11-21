const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ServicesType = sequelize.define("tbl_services_type", {
  service_type_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  service_type_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  service_type_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ServicesType;
