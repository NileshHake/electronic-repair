const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const InventoryItem = sequelize.define(
    "tbl_inventory_items",
    {
        inventory_item_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        inventory_item_name: {
            type: DataTypes.STRING,
            allowNull: false,        // SSD, RAM, Battery, USB Port etc.
        },

        inventory_item_category: {
            type: DataTypes.STRING,
            allowNull: true,         // electronic / part / accessory
        },

        inventory_item_brand: {
            type: DataTypes.STRING,
            allowNull: true,         // HP, Dell, Samsung, Kingston etc.
        },

        inventory_item_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        inventory_item_qty: {
            type: DataTypes.INTEGER,
            defaultValue: 0,         // stock quantity
        },

        inventory_item_purchase_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        inventory_item_sale_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        inventory_created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        inventory_item_status: {
            type: DataTypes.TINYINT, 
            defaultValue: 1,         // 1 = Active, 0 = Inactive
        },
    }
);

module.exports = InventoryItem;
