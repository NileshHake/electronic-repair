const { Sequelize } = require("sequelize");

// ✅ Load correct env file
require("dotenv").config({
  path: process.env.DOCKER ? ".env.docker" : ".env.local",
});

// ✅ Sequelize using ENV (NO hardcode)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false, // production clean logs
  }
);

module.exports = sequelize;

// const sequelize = new Sequelize(
//    "repaircrm_db",
//    "root",
//   "",
//   {
//     host: "localhost",
//     port: 3306,
//     dialect: 'mysql',
//   }
// );


// module.exports = sequelize;
