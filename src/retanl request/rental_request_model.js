const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const RentalRequest = sequelize.define(
  "tbl_rental_requests",
  {
    rental_request_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    req_rental_device_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    invoice_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ store vendor snapshot (single vendor)
    selected_vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },


    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ PRICE SNAPSHOT (so future device changes won’t affect old orders)
    rent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    security_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    // ✅ totals
    rent_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rent_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    base_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gst_percentage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    // ✅ payments
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    payment_mode: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    payment_status: {
      // 0 Pending, 1 Partial, 2 Paid, 3 Refunded
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // ✅ delivery/return tracking
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    returned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ✅ status
    request_status: {
      /*
        0 Pending
        1 Accepted
        2 Shipped
        3 Start
        4 Cancelled
        5 Expired
      */
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // ✅ cancel info
    cancel_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_by: {
      // "customer" | "vendor" | "admin"
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = RentalRequest;