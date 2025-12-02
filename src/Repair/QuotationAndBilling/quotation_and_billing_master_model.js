const { DataTypes } = require("sequelize"); 
const sequelize = require("../../../config/db");

const QuotationAndBillingMaster = sequelize.define(
    "tbl_quotation_and_billing_master",
    {
        quotation_and_billing_master_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quotation_and_billing_master_invoice_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotation_and_billing_master_date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotation_and_billing_master_customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotation_and_billing_master_repair_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotation_and_billing_master_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
       
        quotation_and_billing_master_gst_amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quotation_and_billing_master_grand_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quotation_and_billing_master_created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quotation_and_billing_master_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
        },
    },

);

module.exports = QuotationAndBillingMaster;
