const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RepairType = sequelize.define("tbl_repair_type", {
  repair_type_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  repair_type_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  repair_type_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   
});

module.exports = RepairType;
