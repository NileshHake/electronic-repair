const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AddToCard = sequelize.define(
    "tbl_add_to_card",
    {
        add_to_card_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        add_to_card_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        add_to_card_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        add_to_card_product_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        add_to_card_product_qty: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },

        add_to_card_product_sale_rice: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },

        add_to_card_product_mrp: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        add_to_card_product_discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        add_to_card_product_total: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },



        add_to_card_product_discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },

        add_to_card_remark: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "tbl_add_to_card",
        timestamps: true,
    }
);

module.exports = AddToCard;
