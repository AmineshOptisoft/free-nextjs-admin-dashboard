import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

type CandidateRow = RowDataPacket & {
  pay_method_id: number;
  agent_id: number;
  upi_id: string | null;
  payment_method: string;
  bank_name: string | null;
  account_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  account_holder_name: string | null;
  full_name: string | null;
};

export type AssignResult = {
  assigned: boolean;
  payMethodId?: number;
  agentId?: number;
  reason?: string;
};

function buildUpiPayload(upi: string, payeeName: string, amount: number): string {
  const params = new URLSearchParams({
    pa: upi.trim(),
    pn: (payeeName || "Payee").trim(),
    am: String(amount),
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}

/** Build candidate query: params are [amount, amount] for pay-in limit + pool check, then optional method. */
function buildCandidateQuery(preferredMethod: "UPI" | "BANK" | "", useAmount: number): { sql: string; params: (number | string)[] } {
  const params: (number | string)[] = [useAmount, useAmount];
  let sql = `SELECT
       pm.id AS pay_method_id,
       pm.agent_id AS agent_id,
       pm.upi_id,
       pm.payment_method,
       pm.bank_name,
       pm.account_no AS account_no,
       pm.ifsc_code,
       pm.branch_name,
       pm.account_holder_name,
       pm.full_name
     FROM \`pay_methods\` pm
     INNER JOIN \`agents\` a ON a.id = pm.agent_id
     WHERE pm.agent_id IS NOT NULL
       AND pm.status = 'ACTIVE'
       AND pm.enable_pay_in = 1
       AND a.status = 'active'
       AND (pm.pay_in_limit <= 0 OR (pm.today_total_pay_in_amount + ?) <= pm.pay_in_limit)
       AND (
         COALESCE(a.security_deposit, 0) + COALESCE(a.credit_limit, 0) - COALESCE(a.running_balance, 0)
       ) >= ? + COALESCE((
         SELECT SUM(pm2.today_total_pay_in_amount) FROM \`pay_methods\` pm2 WHERE pm2.agent_id = pm.agent_id
       ), 0)`;
  if (preferredMethod === "UPI" || preferredMethod === "BANK") {
    sql += " AND pm.payment_method = ? ";
    params.push(preferredMethod);
  }
  sql += " ORDER BY RAND() LIMIT 1";
  return { sql, params };
}

/**
 * Auto-assign PAYIN: only while status is NOT_ASSIGNED.
 * Uses a DB transaction, random eligible pay_method, pool + per-account limits, then increments today_total_pay_in_amount.
 */
export async function tryAssignPayInTransaction(
  txId: number,
  amount: number,
  preferredMethod?: "UPI" | "BANK" | "",
  options?: { maxAttempts?: number },
): Promise<AssignResult> {
  const maxAttempts = options?.maxAttempts ?? 5;
  const method = preferredMethod ?? "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [lockRows] = await conn.execute<RowDataPacket[]>(
        `SELECT \`id\`, \`status\`, \`amount\`, \`type\`
         FROM \`transactions\`
         WHERE \`id\` = ? AND \`type\` = 'PAYIN'
         FOR UPDATE`,
        [txId],
      );
      const cur = lockRows[0] as { status: string; amount: string | number } | undefined;
      if (!cur) {
        await conn.rollback();
        return { assigned: false, reason: "Transaction not found." };
      }
      if (String(cur.status).toUpperCase() !== "NOT_ASSIGNED") {
        await conn.rollback();
        return { assigned: false, reason: "Not in NOT_ASSIGNED state." };
      }

      const amt = typeof cur.amount === "number" ? cur.amount : Number.parseFloat(String(cur.amount));
      const useAmount = Number.isFinite(amt) && amt > 0 ? amt : amount;

      const { sql: candSql, params: candParams } = buildCandidateQuery(method, useAmount);
      const [candidates] = await conn.execute<CandidateRow[]>(candSql, candParams);
      const candidate = candidates[0];
      if (!candidate) {
        await conn.rollback();
        return { assigned: false, reason: "No eligible active payin account available right now." };
      }

      const [incRes] = await conn.execute<ResultSetHeader>(
        `UPDATE \`pay_methods\`
         SET \`today_total_pay_in_amount\` = \`today_total_pay_in_amount\` + ?
         WHERE \`id\` = ?
           AND \`status\` = 'ACTIVE'
           AND \`enable_pay_in\` = 1
           AND (\`pay_in_limit\` <= 0 OR (\`today_total_pay_in_amount\` + ?) <= \`pay_in_limit\`)`,
        [useAmount, candidate.pay_method_id, useAmount],
      );
      if (incRes.affectedRows === 0) {
        await conn.rollback();
        continue;
      }

      const payeeLabel =
        (candidate.account_holder_name && String(candidate.account_holder_name).trim()) ||
        (candidate.full_name && String(candidate.full_name).trim()) ||
        "Payee";
      const qr =
        String(candidate.payment_method).toUpperCase() === "UPI" && candidate.upi_id
          ? buildUpiPayload(String(candidate.upi_id), payeeLabel, useAmount)
          : null;

      const [updRes] = await conn.execute<ResultSetHeader>(
        `UPDATE \`transactions\`
         SET \`pay_method_id\` = ?,
             \`assigned_agent_id\` = ?,
             \`assigned_upi\` = ?,
             \`payment_method\` = ?,
             \`bank_name\` = ?,
             \`bank_account_number\` = ?,
             \`ifsc_code\` = ?,
             \`branch_name\` = ?,
             \`account_holder_name\` = ?,
             \`assigned_by\` = ?,
             \`qr_code_url\` = ?,
             \`status\` = 'PENDING',
             \`assigned_date\` = NOW(),
             \`not_assigned_date\` = NULL
         WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND \`status\` = 'NOT_ASSIGNED'`,
        [
          candidate.pay_method_id,
          candidate.agent_id,
          candidate.upi_id,
          candidate.payment_method,
          candidate.bank_name ?? null,
          candidate.account_no ?? null,
          candidate.ifsc_code ?? null,
          candidate.branch_name ?? null,
          candidate.account_holder_name ?? null,
          candidate.pay_method_id,
          qr,
          txId,
        ],
      );
      if (updRes.affectedRows === 0) {
        await conn.rollback();
        continue;
      }

      await conn.commit();
      return { assigned: true, payMethodId: candidate.pay_method_id, agentId: candidate.agent_id };
    } catch (e) {
      await conn.rollback();
      if (attempt === maxAttempts - 1) throw e;
    } finally {
      conn.release();
    }
  }

  return { assigned: false, reason: "Assignment conflict — please retry." };
}
