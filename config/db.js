require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "repaircrm_db",
  timezone: process.env.DB_TIMEZONE || "+05:30",
  define: {
    timestamps: true,
  },
  logging: false, // optional: turn off SQL query logs
});

module.exports = sequelize;
