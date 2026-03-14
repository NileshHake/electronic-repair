const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RentalDevice = sequelize.define(
    "tbl_rental_devices",
    {
        rental_device_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        device_sub_category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        device_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        device_brand: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_model: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        specs_json: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        images: {
            // store array of image URLs
            type: DataTypes.JSON,
            allowNull: true,
        },

        stock_qty: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        available_qty: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        base_rent_per_day: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        base_rent_per_week: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        base_rent_per_month: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        security_deposit: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        min_rental_days: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },

        delivery_available: {
            type: DataTypes.INTEGER, // 0 = No, 1 = Yes         
            defaultValue: 0,
        },

        delivery_fee: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        status: {
            type: DataTypes.STRING, // active / inactive
            defaultValue: "active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = RentalDevice;