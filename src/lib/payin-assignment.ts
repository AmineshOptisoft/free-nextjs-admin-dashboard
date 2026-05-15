import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { emitTransactionRealtime } from "@/lib/realtime/broadcast-transaction";

async function countScalar(sql: string, params: (string | number)[]): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  const v = rows[0]?.c ?? rows[0]?.C;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Human-readable reason when no `pay_methods` row matches the assignment query
 * (separate from race/conflict retries).
 */
export async function explainPayInAssignmentFailure(amount: number, preferredMethod: "UPI" | "BANK" | ""): Promise<string> {
  const activeAgents = await countScalar(`SELECT COUNT(*) AS c FROM \`agents\` WHERE LOWER(TRIM(\`status\`)) = 'active'`, []);
  if (activeAgents === 0) {
    return "No agent is active (all are inactive, pending, or blocked). Activate an agent to accept PayIns.";
  }

  const enabledLines = await countScalar(
    `SELECT COUNT(*) AS c FROM \`pay_methods\` pm
     INNER JOIN \`agents\` a ON a.\`id\` = pm.\`agent_id\`
     WHERE pm.\`enable_pay_in\` = 1 AND UPPER(TRIM(pm.\`status\`)) = 'ACTIVE' AND LOWER(TRIM(a.\`status\`)) = 'active'`,
    [],
  );
  if (enabledLines === 0) {
    return "No Pay In–enabled active payment method exists: turn on Pay In on an agent’s UPI/Bank line, or activate the agent account.";
  }

  if (preferredMethod === "UPI" || preferredMethod === "BANK") {
    const methodLines = await countScalar(
      `SELECT COUNT(*) AS c FROM \`pay_methods\` pm
       INNER JOIN \`agents\` a ON a.\`id\` = pm.\`agent_id\`
       WHERE pm.\`enable_pay_in\` = 1 AND UPPER(TRIM(pm.\`status\`)) = 'ACTIVE' AND LOWER(TRIM(a.\`status\`)) = 'active'
         AND UPPER(TRIM(pm.\`payment_method\`)) = ?`,
      [preferredMethod],
    );
    if (methodLines === 0) {
      return `No active Pay In line uses ${preferredMethod}. Add a ${preferredMethod} method or change the payer’s payment type.`;
    }
  }

  const limitParams: (string | number)[] = [amount];
  let limitSql = `SELECT COUNT(*) AS c FROM \`pay_methods\` pm
     INNER JOIN \`agents\` a ON a.\`id\` = pm.\`agent_id\`
     WHERE pm.\`enable_pay_in\` = 1 AND UPPER(TRIM(pm.\`status\`)) = 'ACTIVE' AND LOWER(TRIM(a.\`status\`)) = 'active'
       AND (pm.\`pay_in_limit\` <= 0 OR (pm.\`today_total_pay_in_amount\` + ?) <= pm.\`pay_in_limit\`)`;
  if (preferredMethod === "UPI" || preferredMethod === "BANK") {
    limitSql += " AND UPPER(TRIM(pm.`payment_method`)) = ?";
    limitParams.push(preferredMethod);
  }
  const underLimit = await countScalar(limitSql, limitParams);
  if (underLimit === 0) {
    return "All matching Pay In accounts have hit their daily Pay In limit (today’s total + this amount exceeds the cap). Raise limits or retry after reset.";
  }

  const poolParams: (string | number)[] = [amount, amount];
  let poolSql = `SELECT COUNT(*) AS c FROM \`pay_methods\` pm
     INNER JOIN \`agents\` a ON a.\`id\` = pm.\`agent_id\`
     WHERE pm.\`enable_pay_in\` = 1 AND UPPER(TRIM(pm.\`status\`)) = 'ACTIVE' AND LOWER(TRIM(a.\`status\`)) = 'active'
       AND (pm.\`pay_in_limit\` <= 0 OR (pm.\`today_total_pay_in_amount\` + ?) <= pm.\`pay_in_limit\`)
       AND (
         COALESCE(a.\`security_deposit\`, 0) + COALESCE(a.\`credit_limit\`, 0) - COALESCE(a.\`running_balance\`, 0)
       ) >= ? + COALESCE((
         SELECT SUM(pm2.\`today_total_pay_in_amount\`) FROM \`pay_methods\` pm2 WHERE pm2.\`agent_id\` = pm.\`agent_id\`
       ), 0)`;
  if (preferredMethod === "UPI" || preferredMethod === "BANK") {
    poolSql += " AND UPPER(TRIM(pm.`payment_method`)) = ?";
    poolParams.push(preferredMethod);
  }
  const poolOk = await countScalar(poolSql, poolParams);
  if (poolOk === 0) {
    return "Agent security/credit pool is insufficient for this Pay In after today’s Pay In exposure on that agent. Add credit, lower running balance, or reduce amount.";
  }

  return "No line matched at assignment time (another Pay In may have taken capacity). Please retry.";
}

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

type CandidatePickOpts = {
  /** When set, prefer agents with fewer PayIns already assigned today for this company. */
  companyId: number | null;
  /** Agents to skip this pick (e.g. failed increment/update in a previous retry). */
  excludeAgentIds: number[];
};

/** Eligible pay_method row: same filters as assign; order = least loaded agent today, then random tie-break. */
function buildCandidateQuery(
  preferredMethod: "UPI" | "BANK" | "",
  useAmount: number,
  pick: CandidatePickOpts,
): { sql: string; params: (number | string)[] } {
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
       AND LOWER(TRIM(a.\`status\`)) = 'active'
       AND (pm.pay_in_limit <= 0 OR (pm.today_total_pay_in_amount + ?) <= pm.pay_in_limit)
       AND (
         COALESCE(a.security_deposit, 0) + COALESCE(a.credit_limit, 0) - COALESCE(a.running_balance, 0)
       ) >= ? + COALESCE((
         SELECT SUM(pm2.today_total_pay_in_amount) FROM \`pay_methods\` pm2 WHERE pm2.agent_id = pm.agent_id
       ), 0)`;

  const uniqExclude = [...new Set(pick.excludeAgentIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (uniqExclude.length > 0) {
    sql += ` AND pm.agent_id NOT IN (${uniqExclude.map(() => "?").join(", ")}) `;
    params.push(...uniqExclude);
  }

  if (preferredMethod === "UPI" || preferredMethod === "BANK") {
    sql += " AND pm.payment_method = ? ";
    params.push(preferredMethod);
  }

  if (pick.companyId != null && pick.companyId > 0) {
    sql += ` ORDER BY (
       SELECT COUNT(*) FROM \`transactions\` t2
       WHERE t2.type = 'PAYIN'
         AND t2.assigned_agent_id = pm.agent_id
         AND t2.assigned_date IS NOT NULL
         AND DATE(t2.assigned_date) = CURDATE()
         AND t2.company_id = ?
     ) ASC, RAND() LIMIT 1`;
    params.push(pick.companyId);
  } else {
    sql += ` ORDER BY (
       SELECT COUNT(*) FROM \`transactions\` t2
       WHERE t2.type = 'PAYIN'
         AND t2.assigned_agent_id = pm.agent_id
         AND t2.assigned_date IS NOT NULL
         AND DATE(t2.assigned_date) = CURDATE()
     ) ASC, RAND() LIMIT 1`;
  }

  return { sql, params };
}

/**
 * Auto-assign PAYIN: only while status is NOT_ASSIGNED.
 * Picks among eligible pay_methods using least-loaded-by-agent-today (per company when `company_id` is set),
 * avoids re-picking agents that failed in the same retry sequence when others exist, then increments
 * `today_total_pay_in_amount` and updates the transaction under row locks.
 */
export async function tryAssignPayInTransaction(
  txId: number,
  amount: number,
  preferredMethod?: "UPI" | "BANK" | "",
  options?: { maxAttempts?: number },
): Promise<AssignResult> {
  const maxAttempts = options?.maxAttempts ?? 5;
  const method = preferredMethod ?? "";
  /** Skip these agent ids on the next pick when multiple agents could still match. */
  const excludeAgents: number[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [lockRows] = await conn.execute<RowDataPacket[]>(
        `SELECT \`id\`, \`status\`, \`amount\`, \`type\`, \`company_id\`
         FROM \`transactions\`
         WHERE \`id\` = ? AND \`type\` = 'PAYIN'
         FOR UPDATE`,
        [txId],
      );
      const cur = lockRows[0] as
        | { status: string; amount: string | number; company_id: number | null }
        | undefined;
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
      const rawCo = cur.company_id;
      const fairCompanyId = rawCo != null && Number(rawCo) > 0 ? Number(rawCo) : null;

      let candidate: CandidateRow | undefined;
      for (const relax of [false, true] as const) {
        const pick: CandidatePickOpts = {
          companyId: fairCompanyId,
          excludeAgentIds: relax ? [] : excludeAgents,
        };
        const { sql: candSql, params: candParams } = buildCandidateQuery(method, useAmount, pick);
        const [candidates] = await conn.execute<CandidateRow[]>(candSql, candParams);
        candidate = candidates[0];
        if (candidate) break;
      }

      if (!candidate) {
        await conn.rollback();
        const detail = await explainPayInAssignmentFailure(useAmount, method);
        return { assigned: false, reason: detail };
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
        if (!excludeAgents.includes(candidate.agent_id)) excludeAgents.push(candidate.agent_id);
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
        if (!excludeAgents.includes(candidate.agent_id)) excludeAgents.push(candidate.agent_id);
        continue;
      }

      await conn.commit();
      emitTransactionRealtime(txId, "assign");
      return { assigned: true, payMethodId: candidate.pay_method_id, agentId: candidate.agent_id };
    } catch (e) {
      await conn.rollback();
      if (attempt === maxAttempts - 1) throw e;
    } finally {
      conn.release();
    }
  }

  const detail = await explainPayInAssignmentFailure(amount, method);
  return { assigned: false, reason: `${detail} (assignment conflict after retries — please retry.)` };
}

/** Shown when auto-assign finds no eligible account and the draft PAYIN row is removed. */
export const PAYIN_NO_ELIGIBLE_AGENT_MESSAGE =
  "No agent payment account is available right now. The PayIn was not created — please try again later.";

/** Delete a PAYIN that never left NOT_ASSIGNED (safe guard: only that status). */
export async function deleteNotAssignedPayIn(txId: number): Promise<void> {
  await pool.execute(
    `DELETE FROM \`transactions\` WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND UPPER(TRIM(\`status\`)) = 'NOT_ASSIGNED'`,
    [txId],
  );
}
