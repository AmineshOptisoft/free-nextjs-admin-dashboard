/** MySQL / MariaDB: missing table or view (errno often 1146). */
export function isMysqlErNoSuchTable(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "ER_NO_SUCH_TABLE"
  );
}

/** Shown in API JSON when `pay_methods` is missing from the DB. */
export const PAY_METHODS_TABLE_HINT =
  "Table pay_methods is missing. Import database/tepay-schema.sql into database tepay (or create pay_methods per that file).";
