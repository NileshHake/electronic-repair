const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const StoreFeature = sequelize.define(
  "tbl_store_feature",
  {
    feature_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feature_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = Active, 0 = Inactive
    },
    feature_created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "tbl_store_feature",
    timestamps: true, // ✅ createdAt & updatedAt auto set
  }
);

module.exports = StoreFeature;
