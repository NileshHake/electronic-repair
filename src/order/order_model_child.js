const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OrderChild = sequelize.define(
    "tbl_order_child",
    {
        order_child_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        order_child_master_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        order_child_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        order_child_product_qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        order_child_product_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_sub_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_delivery_charge: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_gst_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_gst_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_grand_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },

        order_child_status: {
            type: DataTypes.INTEGER, // ✅ FIXED
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "tbl_order_child",
        timestamps: true,
    }
);

module.exports = OrderChild;
