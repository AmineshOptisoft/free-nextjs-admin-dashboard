import { randomBytes } from "crypto";
import type { Pool } from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

/** Unique public code for this vendor (referrals / tracking). */
export async function allocateAgentReferralCode(pool: Pool): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const raw = randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const code = `V${(raw + randomBytes(4).toString("hex").toUpperCase()).slice(0, 10)}`;
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT `id` FROM `agents` WHERE `referral_code` = ? LIMIT 1",
      [code],
    );
    if (!rows.length) return code.slice(0, 32);
  }
  throw new Error("Could not allocate agent referral code");
}
