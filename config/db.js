const { Sequelize } = require('sequelize');

require('dotenv').config({
  path: process.env.DOCKER ? '.env.docker' : '.env.local'
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
  }
);
// const sequelize = new Sequelize(
//   "repaircrm_db",   // DB name
//   "root",           // MySQL user
//   "",               // MySQL password (empty)
//   {
//     host: "localhost",
//     port: 3306,
//     dialect: "mysql",
//     logging: false, // true karoge to SQL logs dikhenge
//   }
// );


module.exports = sequelize;
