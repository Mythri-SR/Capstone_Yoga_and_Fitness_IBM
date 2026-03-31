import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));

function loadBackendEnv() {
  const p = join(root, '../backend/.env');
  const text = readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function resolveMysqlBin() {
  const winMysql = 'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe';
  return process.platform === 'win32' && existsSync(winMysql) ? winMysql : 'mysql';
}

function mysqlBaseArgs(host, port, user, password) {
  return [`-h${host}`, `-P${port}`, `-u${user}`, `--password=${password}`];
}

function runSqlFile(mysqlBin, baseArgs, database, filePath) {
  const input = readFileSync(filePath);
  const args = database ? [...baseArgs, database] : baseArgs;
  execFileSync(mysqlBin, args, { input, stdio: ['pipe', 'inherit', 'inherit'], env: process.env });
}

function ensureDatabaseExists(mysqlBin, baseArgs, database) {
  const safe = database.replace(/`/g, '``');
  const sql = `CREATE DATABASE IF NOT EXISTS \`${safe}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
  execFileSync(mysqlBin, [...baseArgs, '-e', sql], { stdio: 'inherit', env: process.env });
}

function hasBookingsTable(mysqlBin, baseArgs, database) {
  const safe = database.replace(/'/g, "''");
  const sql = `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${safe}' AND table_name='bookings'`;
  try {
    const out = execFileSync(mysqlBin, [...baseArgs, '-N', '-e', sql], {
      encoding: 'utf8',
      env: process.env,
    });
    return out.trim() === '1';
  } catch {
    return false;
  }
}

/**
 * Clears bookings/reviews and reopens slots so the suite is deterministic.
 * If core tables are missing, applies database/schema.sql and database/seed.sql once.
 * Set PW_RESET_DB=0 to skip (not recommended unless you manage DB state yourself).
 */
export default async function globalSetup() {
  const flag = process.env.PW_RESET_DB;
  if (flag === '0' || flag === 'false') return;

  loadBackendEnv();
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  if (!user || !database) {
    console.warn('global-setup: skipping DB reset (DB_USER / DB_NAME missing)');
    return;
  }

  const mysqlBin = resolveMysqlBin();
  const baseArgs = mysqlBaseArgs(host, port, user, password);

  ensureDatabaseExists(mysqlBin, baseArgs, database);

  if (!hasBookingsTable(mysqlBin, baseArgs, database)) {
    console.warn('global-setup: bookings table missing — applying schema + seed');
    const schemaPath = join(root, '../database/schema.sql');
    const seedPath = join(root, '../database/seed.sql');
    runSqlFile(mysqlBin, baseArgs, database, schemaPath);
    runSqlFile(mysqlBin, baseArgs, database, seedPath);
  }

  const sqlPath = join(root, 'scripts', 'reset-e2e-data.sql');
  const input = readFileSync(sqlPath);
  const args = [...baseArgs, database];
  execFileSync(mysqlBin, args, { input, stdio: ['pipe', 'inherit', 'inherit'], env: process.env });
  console.log('global-setup: E2E DB reset applied (set PW_RESET_DB=0 to skip)');
}
