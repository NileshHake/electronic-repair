// models/beading_request_vendor_model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BeadingRequestVendor = sequelize.define(
  "tbl_beading_request_vendor",
  {
    br_vendor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    beading_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },

    vendor_beading_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    vendor_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    vendor_offer_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
   
    },

    offered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tbl_beading_request_vendor",
    timestamps: true,
  }
);

module.exports = BeadingRequestVendor;