const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RoleHasPermission = sequelize.define(
    "tbl_role_has_permission",
    {
        rhp_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        rhp_role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
     
        rhp_permission_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true, 
    }
);

module.exports = RoleHasPermission;
