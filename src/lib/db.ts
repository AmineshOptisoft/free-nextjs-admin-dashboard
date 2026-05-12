import mysql from "mysql2/promise";

function getPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "tepay",
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
  });
}

const globalForDb = globalThis as unknown as { mysqlPool?: ReturnType<typeof getPool> };

export const pool = globalForDb.mysqlPool ?? getPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}
