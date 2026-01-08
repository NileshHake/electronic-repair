const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Product = sequelize.define("tbl_product", {
  product_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_tax: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_description: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  product_usage_type: {
    type: DataTypes.ENUM("sale", "repair", "both"),
    allowNull: false,
  }
  ,
  product_brand: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_category: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_material: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_purchase_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  product_sale_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  product_mrp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  product_on_sale: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  product_discount: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  product_status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

module.exports = Product;
