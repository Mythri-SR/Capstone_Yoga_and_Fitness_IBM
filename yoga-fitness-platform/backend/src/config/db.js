import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'yogaapp',
  password: process.env.DB_PASSWORD || 'yogapass',
  database: process.env.DB_NAME || 'yoga_fitness',
  waitForConnections: true,
  connectionLimit: 10,
});

/** For SELECT: array of rows. For INSERT/UPDATE: ResultSetHeader (use .insertId, .affectedRows). */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export { pool };
