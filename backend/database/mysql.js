const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const mysql = require("mysql2/promise");
exports.db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: 3306,
});

const result = dotenv.config({
  path: path.join(__dirname, "../.env"),
});
if (result.error) {
  console.error(result.error);
}

// console.log(result);
