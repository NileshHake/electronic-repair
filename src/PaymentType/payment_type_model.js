const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PaymentType = sequelize.define(
  "tbl_payment_type",
  {
    payment_type_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_type: {
      type: DataTypes.STRING ,
      allowNull: false,
    },
    
    payment_type_created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    payment_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, 
    },
  },
  
);

module.exports = PaymentType;
