const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Slider = sequelize.define(
  "tbl_slider",
  {
    slider_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    pre_title_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pre_title_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subtitle_text_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subtitle_percent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    subtitle_text_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    slider_image: {
      type: DataTypes.STRING,  
      allowNull: true,
    },
    slider_for_product: {
      type: DataTypes.STRING,  
      allowNull: true,
    },
    slider_old_price: {
      type: DataTypes.STRING,  
      allowNull: true,
    },
    slider_bg_text: {
      type: DataTypes.STRING,  
      allowNull: true,
    },
    green_bg: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },

    is_light: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },

    slider_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = Active
    },
  },
  {
    tableName: "tbl_slider",
  }
);

module.exports = Slider;
