const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Accessories = sequelize.define("tbl_accessories", {
  accessories_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accessories_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  accessories_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   
});

module.exports = Accessories;
