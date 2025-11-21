const { DataTypes } = require('sequelize');
const sequelize = require("../../config/db");

const Permission = sequelize.define(
  'tbl_permission',
  {
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    permission_name: {
      type: DataTypes.STRING,
    },
    permission_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permission_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true, // 👈 this stops Sequelize from pluralizing
  }
);

module.exports = Permission;
