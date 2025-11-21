const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Role = sequelize.define(
  "tbl_roles",
  {
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Role;
