const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Status = sequelize.define("tbl_status", {
  status_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status_color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = Status;
