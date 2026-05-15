import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

/** Amounts shown on Payment Method cards — sourced from `transactions`. */
export type PayMethodFinancial = {
  totalPayIn: number;
  totalPayOut: number;
  successPayIn: number;
  failedPayIn: number;
  successPayOut: number;
  failedPayOut: number;
};

export function emptyPayMethodFinancial(): PayMethodFinancial {
  return {
    totalPayIn: 0,
    totalPayOut: 0,
    successPayIn: 0,
    failedPayIn: 0,
    successPayOut: 0,
    failedPayOut: 0,
  };
}

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

const SUCCESS_IN_SQL = `('PAID','APPROVED','APPROVED_BY_ADMIN','APPROVED_BY_AGENT','EXPIRED_APPROVED_BY_ADMIN','EXPIRED_APPROVED_BY_AGENT')`;
const FAILED_IN_SQL = `('REJECTED','REVOKED','EXPIRED','NOT_ASSIGNED')`;

/**
 * Aggregates `transactions` for this agent, grouped by `pay_method_id` (= `pay_methods.id`).
 */
export async function loadPayMethodFinancials(
  agentId: number,
  payMethodIds: number[],
  from?: Date | null,
  to?: Date | null,
): Promise<Map<number, PayMethodFinancial>> {
  const out = new Map<number, PayMethodFinancial>();
  for (const id of payMethodIds) {
    out.set(id, emptyPayMethodFinancial());
  }

  const ids = payMethodIds.filter((id) => Number.isInteger(id) && id > 0);
  if (ids.length === 0) return out;

  const placeholders = ids.map(() => "?").join(",");

  let dateClause = "";
  const dateParams: unknown[] = [];
  if (from) {
    dateClause += " AND t.`created_at` >= ?";
    dateParams.push(from);
  }
  if (to) {
    dateClause += " AND t.`created_at` <= ?";
    dateParams.push(to);
  }

  const sql = `
    SELECT
      t.\`pay_method_id\` AS link_id,
      t.\`type\` AS typ,
      SUM(t.\`amount\`) AS total_amt,
      SUM(CASE WHEN t.\`status\` IN ${SUCCESS_IN_SQL} THEN t.\`amount\` ELSE 0 END) AS success_amt,
      SUM(CASE WHEN t.\`status\` IN ${FAILED_IN_SQL} THEN t.\`amount\` ELSE 0 END) AS failed_amt
    FROM \`transactions\` t
    WHERE t.\`assigned_agent_id\` = ?
      AND t.\`pay_method_id\` IS NOT NULL
      AND t.\`pay_method_id\` IN (${placeholders})
      ${dateClause}
    GROUP BY t.\`pay_method_id\`, t.\`type\`
  `;
  const params: unknown[] = [agentId, ...ids, ...dateParams];

  type AggRow = RowDataPacket & {
    link_id: number;
    typ: string;
    total_amt: string | number | null;
    success_amt: string | number | null;
    failed_amt: string | number | null;
  };

  try {
    const [rows] = await pool.execute(sql, params as (string | number)[]);
    const aggRows = rows as AggRow[];

    for (const row of aggRows) {
      const linkId = Number(row.link_id);
      if (!Number.isInteger(linkId) || linkId < 1) continue;
      const cur = out.get(linkId) ?? emptyPayMethodFinancial();
      const total = num(row.total_amt);
      const success = num(row.success_amt);
      const failed = num(row.failed_amt);

      if (row.typ === "PAYIN") {
        cur.totalPayIn = total;
        cur.successPayIn = success;
        cur.failedPayIn = failed;
      } else if (row.typ === "PAYOUT") {
        cur.totalPayOut = total;
        cur.successPayOut = success;
        cur.failedPayOut = failed;
      }
      out.set(linkId, cur);
    }
  } catch {
    /* missing `transactions` or query error — leave zeros */
  }

  return out;
}