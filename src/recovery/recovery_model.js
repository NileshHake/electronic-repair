const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Recovery = sequelize.define("tbl_recovery", {
    recovery_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    recovery_customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    recovery_problem_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    recovery_estimated_cost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    recovery_received_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    recovery_expected_delivery_date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    recovery_assigned_technician_to: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    recovery_delivery_and_pickup_to: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    recovery_created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    recovery_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    recovery_workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recovery_workflow_stage_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recovery_quotation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recovery_bill_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recovery_status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
});

module.exports = Recovery;
