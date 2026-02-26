const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Gst = sequelize.define(
    "tbl_gst",
    {
        gst_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        // 🔹 Basic GST Info
        gst_gstin: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
        },

        gst_legal_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_trade_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_status: {
            type: DataTypes.STRING,
            allowNull: true, // Active / Cancelled
        },

        gst_registration_date: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_constitution: {
            type: DataTypes.STRING,
            allowNull: true, // Proprietorship / Pvt Ltd
        },

        gst_type: {
            type: DataTypes.STRING,
            allowNull: true, // Regular / Composition
        },

        // 🔹 Business Nature (array from API → store as JSON)
        gst_nature_of_business: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        // 🔹 Address
        gst_principal_address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // 🔹 Jurisdiction
        gst_state_jurisdiction: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        gst_central_jurisdiction: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // 🔹 Aadhaar Verification
        gst_aadhar_verified: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_aadhar_verified_date: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 🔹 eInvoice
        gst_einvoice_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 🔹 Extra Flags
        gst_field_visit_conducted: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_ntcrbs: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_ekyc_flag: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gst_full_response: {
            type: DataTypes.JSON,   // Stores full object
            allowNull: true,
        },
        // 🔹 Audit
        gst_created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        gst_status_flag: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    },
    {
        tableName: "tbl_gst",
        timestamps: true, // createdAt, updatedAt
    }
);

module.exports = Gst;