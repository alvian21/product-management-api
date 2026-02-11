const environment = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `.env.${environment}`,
});

module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  },
};
