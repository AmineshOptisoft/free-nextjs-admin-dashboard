import type { Pool } from "mysql2/promise";

/** Pay-in / pay-out request window from `created_at` / insert time (minutes). */
export const REQUEST_EXPIRE_MINUTES = 5;

/** SQL fragment: expiry timestamp from current server time. */
export function sqlExpiresAtFromNow(): string {
  return `DATE_ADD(NOW(), INTERVAL ${REQUEST_EXPIRE_MINUTES} MINUTE)`;
}

/**
 * Marks open pay-in / pay-out rows as EXPIRED when `expires_at` has passed.
 * Call before listing or reading a request so UI matches DB.
 */
export async function expireOpenRequestsPastDeadline(db: Pick<Pool, "execute">): Promise<void> {
  await db.execute(
    `UPDATE \`transactions\`
     SET \`status\` = 'EXPIRED'
     WHERE \`expires_at\` IS NOT NULL
       AND \`expires_at\` <= NOW()
       AND \`type\` IN ('PAYIN', 'PAYOUT')
       AND \`status\` IN ('NOT_ASSIGNED', 'PENDING', 'PAID', 'RE_ASSIGNED')`,
  );
}
