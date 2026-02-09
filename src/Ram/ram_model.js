const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Ram = sequelize.define("tbl_ram", {
    ram_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ram_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ram_created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = Ram;
