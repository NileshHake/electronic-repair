const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RentalRequest = sequelize.define(
    "tbl_rental_requests",
    {
        rental_request_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        req_rental_device_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        address_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        from_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        to_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        request_status: {
            /*
              0 Pending
              1 VendorSelected
              2 InProgress
              3 Completed
              4 Cancelled
              5 Expired
            */
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        selected_vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },


    },
    {
        timestamps: true,
    }
);

module.exports = RentalRequest;