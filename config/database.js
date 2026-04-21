import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// ✅ بدل createConnection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  connectionLimit: 10,
  waitForConnections: true,
});

// ❌ مش محتاج connect أصلاً
function DBconnection() {
  console.log("Database pool is ready");
}

export { db, DBconnection };