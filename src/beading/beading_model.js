const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BeadingRequest = sequelize.define(
  "tbl_beading_request",
  {
    beading_request_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    beading_customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    beading_vender_accepted_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null until vendor accepts
    },

    beading_request_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    beading_request_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    beading_budget_min: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    beading_budget_max: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    beading_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // store as STRING (comma separated) OR JSON string
    beading_request_images: {
      type: DataTypes.TEXT, // enough length
      allowNull: true,
    },

    beading_request_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0 pending
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    beading_created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "tbl_beading_request",
    timestamps: true,
  }
);

module.exports = BeadingRequest;
