import crypto from "crypto";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type CompanyApiKeyRow = RowDataPacket & {
  id: number;
  company_id: number;
  label: string;
  key_prefix: string;
  key_hash: string;
  status: "ACTIVE" | "REVOKED";
  created_at: Date | string | null;
  last_used_at: Date | string | null;
};

export type PublicCompanyApiKey = {
  id: string;
  label: string;
  keyPreview: string;
  status: "ACTIVE" | "REVOKED";
  createdAtIso: string | null;
  lastUsedAtIso: string | null;
};

export function hashCompanyApiKey(key: string): string {
  return crypto.createHash("sha256").update(key.trim()).digest("hex");
}

export function generateCompanyApiKey(): { fullKey: string; prefix: string; hash: string } {
  const random = crypto.randomBytes(24).toString("hex");
  const fullKey = `tepay_ck_${random}`;
  const prefix = fullKey.slice(0, 16);
  return { fullKey, prefix, hash: hashCompanyApiKey(fullKey) };
}

export function mapPublicCompanyApiKey(row: CompanyApiKeyRow): PublicCompanyApiKey {
  return {
    id: String(row.id),
    label: row.label?.trim() || "Untitled",
    keyPreview: `${row.key_prefix}…`,
    status: row.status,
    createdAtIso: row.created_at ? new Date(row.created_at as string | Date).toISOString() : null,
    lastUsedAtIso: row.last_used_at ? new Date(row.last_used_at as string | Date).toISOString() : null,
  };
}

export function isMissingCompanyApiKeysTable(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    String((err as { code: unknown }).code) === "ER_NO_SUCH_TABLE"
  );
}

export async function listCompanyApiKeys(pool: Pool, companyId: number): Promise<PublicCompanyApiKey[]> {
  const [rows] = await pool.execute<CompanyApiKeyRow[]>(
    `SELECT \`id\`, \`company_id\`, \`label\`, \`key_prefix\`, \`key_hash\`, \`status\`, \`created_at\`, \`last_used_at\`
     FROM \`company_api_keys\`
     WHERE \`company_id\` = ?
     ORDER BY \`id\` DESC`,
    [companyId],
  );
  return rows.map(mapPublicCompanyApiKey);
}

export async function createCompanyApiKey(
  pool: Pool,
  companyId: number,
  label: string,
): Promise<{ key: PublicCompanyApiKey; fullKey: string }> {
  const cleanLabel = label.trim().slice(0, 100) || "Untitled";
  const { fullKey, prefix, hash } = generateCompanyApiKey();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO \`company_api_keys\` (\`company_id\`, \`label\`, \`key_prefix\`, \`key_hash\`, \`status\`)
     VALUES (?, ?, ?, ?, 'ACTIVE')`,
    [companyId, cleanLabel, prefix, hash],
  );
  const id = Number(result.insertId);
  const [rows] = await pool.execute<CompanyApiKeyRow[]>(
    `SELECT \`id\`, \`company_id\`, \`label\`, \`key_prefix\`, \`key_hash\`, \`status\`, \`created_at\`, \`last_used_at\`
     FROM \`company_api_keys\` WHERE \`id\` = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];
  if (!row) throw new Error("Could not load created API key");
  return { key: mapPublicCompanyApiKey(row), fullKey };
}

export async function revokeCompanyApiKey(pool: Pool, companyId: number, keyId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE \`company_api_keys\`
     SET \`status\` = 'REVOKED'
     WHERE \`id\` = ? AND \`company_id\` = ? AND \`status\` = 'ACTIVE'`,
    [keyId, companyId],
  );
  return result.affectedRows > 0;
}

export async function findCompanyByApiKey(pool: Pool, rawKey: string): Promise<{ companyId: number; keyId: number } | null> {
  const key = rawKey.trim();
  if (!key) return null;
  const hash = hashCompanyApiKey(key);
  const [rows] = await pool.execute<CompanyApiKeyRow[]>(
    `SELECT \`id\`, \`company_id\`
     FROM \`company_api_keys\`
     WHERE \`key_hash\` = ? AND \`status\` = 'ACTIVE'
     LIMIT 1`,
    [hash],
  );
  const row = rows[0];
  if (!row) return null;
  await pool.execute(`UPDATE \`company_api_keys\` SET \`last_used_at\` = CURRENT_TIMESTAMP WHERE \`id\` = ?`, [row.id]);
  return { companyId: Number(row.company_id), keyId: Number(row.id) };
}
