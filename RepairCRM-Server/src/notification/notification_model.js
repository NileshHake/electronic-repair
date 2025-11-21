const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");  

const Notifaction = sequelize.define(
  "tbl_notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notification_assigned_date : {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notification_description: {
      type: DataTypes.STRING,
      defaultValue: "New Notificaion",
      allowNull: true,
    },
    notification_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notification_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,  
  }
);
module.exports = Notifaction;
