const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Generations = sequelize.define("tbl_generations", {
  generations_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  generations_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  generations_brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  generations_created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Generations;
