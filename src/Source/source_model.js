const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Source = sequelize.define("tbl_source", {
  source_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  source_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  source_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   
});

module.exports = Source;
