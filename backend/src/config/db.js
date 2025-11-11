import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Ensure env vars are loaded before creating the pool, regardless of import order
dotenv.config();

// Failsafe: if DB_NAME missing, default to 'adminlms' and warn
const dbName = process.env.DB_NAME && process.env.DB_NAME.trim().length > 0 ? process.env.DB_NAME : "adminlms";
if (!process.env.DB_NAME) {
  // eslint-disable-next-line no-console
  console.warn("DB_NAME env not set. Falling back to 'adminlms'. Set DB_NAME in backend/.env.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;


