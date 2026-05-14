import type { Pool } from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

/** True when `clients.company_id` exists (migration 005 / current schema). */
export async function clientsTableHasCompanyIdColumn(pool: Pool): Promise<boolean> {
  const db = process.env.MYSQL_DATABASE ?? "tepay";
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS \`c\` FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'clients' AND COLUMN_NAME = 'company_id'`,
    [db],
  );
  const c = (rows[0] as { c?: number | bigint }).c;
  return Number(c) > 0;
}
