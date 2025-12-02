const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/db");
 

const QuotationAndBillingChild = sequelize.define(
    "tbl_quotation_and_billing_child",
    {
        quotation_and_billing_child_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quotation_and_billing_item_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotation_and_billing_qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quotation_and_billing_tax_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quotation_and_billing_tax_value: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quotation_and_billing_child_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quotation_and_billing_child_master_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quotation_and_billing_child_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
        },
    },

);

module.exports = QuotationAndBillingChild;
