const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OrderMaster = sequelize.define(
    "tbl_order_master",
    {
        order_master_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        order_master_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_master_vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        order_master_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        order_master_delivery_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        order_master_delivered_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },


        order_master_address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_master_customer_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        order_master_delivery_phone_number: {
            type: DataTypes.STRING(15), // ✅ FIXED
            allowNull: true,
        },
        order_master_sub_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_delivery_charge: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_gst_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_gst_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_grand_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        order_master_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,

        },
    },
    {
        tableName: "tbl_order_master",
        timestamps: true,
    }
);

module.exports = OrderMaster;
