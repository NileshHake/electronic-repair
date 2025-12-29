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
      allowNull: false,
    },

    pre_title_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subtitle_text_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subtitle_percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subtitle_text_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slider_image: {
      type: DataTypes.STRING, // image name
      allowNull: false,
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
