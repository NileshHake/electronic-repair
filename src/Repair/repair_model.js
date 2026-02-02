const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Repair = sequelize.define("tbl_repair", {
  repair_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  repair_customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  repair_problem_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repair_estimated_cost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  repair_received_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  repair_expected_delivery_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_assigned_technician_to: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  repair_delivery_and_pickup_to: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_device_hardware_configuration_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  repair_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  repair_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_workflow_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  repair_workflow_stage_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_referred_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_source_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_service_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_device_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_device_brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_device_color_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_device_model_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_device_storage_location_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  repair_device_serial_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_device_password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_device_accessories_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_device_services_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_device_priority: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repair_quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_bill_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repair_status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

module.exports = Repair;
