import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { AGENT_SETTLED_LEDGER_SQL_IN, MANUAL_PAYIN_STATUS_SQL_IN } from "@/lib/agent-ledger-statuses";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type AgentRow = RowDataPacket & {
  id: number;
  fullname: string | null;
  username: string;
  security_deposit: string | number;
  credit_limit: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  previous_balance: string | number;
  running_balance: string | number;
  settlement_amount: string | number;
  pay_in_commission: string | number;
  pay_out_commission: string | number;
  referral_commission: string | number;
  agg_payin_approved: string | number | null;
  agg_payin_manual: string | number | null;
  agg_payout_total: string | number | null;
  agg_payout_unsettled: string | number | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/**
 * One dashboard row — `agents` holds day counters; aggregates are lifetime from `transactions`.
 * Formulas: PayIn = received, PayOut = sent; Net = PayIn − PayOut; Running = Previous + Net;
 * Final = Running − Security; Remaining = Credit − Final (PAID excluded from ledger sums).
 */
function mapAgent(r: AgentRow) {
  const security = num(r.security_deposit);
  const credit = num(r.credit_limit);
  const netPayIn = num(r.net_pay_in);
  const ledgerPayout = num(r.net_pay_out);
  const prevBalance = num(r.previous_balance);
  const settlement = num(r.settlement_amount);
  const payInCommission = num(r.pay_in_commission);
  const payOutCommission = num(r.pay_out_commission);
  const referralCommission = num(r.referral_commission);

  const approvedPayIn = num(r.agg_payin_approved);
  const manualPayIn = num(r.agg_payin_manual);
  const payoutVolume = num(r.agg_payout_total);
  const unsettlePayout = num(r.agg_payout_unsettled);

  const payout = payoutVolume > 0 ? payoutVolume : ledgerPayout;

  const net = netPayIn - ledgerPayout;
  const running = prevBalance + netPayIn - ledgerPayout;
  const finalBalance = running - security;
  const remainingBalance = credit - finalBalance;

  return {
    id: String(r.id),
    name: (r.fullname && r.fullname.trim()) || r.username,
    security,
    manualPayIn,
    approvedPayIn,
    discounted: 0,
    netPayIn,
    payout,
    unsettlePayout,
    settlement,
    net,
    prevBalance,
    payInCommission,
    payOutCommission,
    referralCommission,
    running,
    runningUnsettled: 0,
    credit,
    finalBalance,
    remainingBalance,
  };
}

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<AgentRow[]>(
      `SELECT a.\`id\`, a.\`fullname\`, a.\`username\`, a.\`security_deposit\`, a.\`credit_limit\`,
              a.\`net_pay_in\`, a.\`net_pay_out\`, a.\`previous_balance\`, a.\`running_balance\`, a.\`settlement_amount\`,
              a.\`pay_in_commission\`, a.\`pay_out_commission\`, a.\`referral_commission\`,
              COALESCE(tx.\`agg_payin_approved\`, 0) AS agg_payin_approved,
              COALESCE(tx.\`agg_payin_manual\`, 0) AS agg_payin_manual,
              COALESCE(tx.\`agg_payout_total\`, 0) AS agg_payout_total,
              COALESCE(tx.\`agg_payout_unsettled\`, 0) AS agg_payout_unsettled
       FROM \`agents\` a
       LEFT JOIN (
         SELECT
           t.\`assigned_agent_id\` AS agent_id,
           SUM(CASE
             WHEN t.\`type\` = 'PAYIN' AND UPPER(TRIM(t.\`status\`)) IN ${AGENT_SETTLED_LEDGER_SQL_IN}
             THEN CAST(t.\`amount\` AS DECIMAL(18, 2))
             ELSE 0
           END) AS agg_payin_approved,
           SUM(CASE
             WHEN t.\`type\` = 'PAYIN'
              AND t.\`assigned_agent_id\` IS NOT NULL AND t.\`assigned_agent_id\` > 0
              AND UPPER(TRIM(t.\`status\`)) IN ${MANUAL_PAYIN_STATUS_SQL_IN}
             THEN CAST(t.\`amount\` AS DECIMAL(18, 2))
             ELSE 0
           END) AS agg_payin_manual,
           SUM(CASE
             WHEN t.\`type\` = 'PAYOUT'
              AND UPPER(TRIM(t.\`status\`)) NOT LIKE '%REJECT%'
              AND UPPER(TRIM(t.\`status\`)) NOT LIKE '%REVOK%'
              AND UPPER(TRIM(t.\`status\`)) NOT IN ('FAILED', 'CANCELLED', 'CANCELED', 'PAID')
             THEN CAST(t.\`amount\` AS DECIMAL(18, 2))
             ELSE 0
           END) AS agg_payout_total,
           SUM(CASE
             WHEN t.\`type\` = 'PAYOUT'
              AND UPPER(TRIM(t.\`status\`)) IN ('PENDING', 'PROCESSING', 'NOT_ASSIGNED', 'RE_ASSIGNED')
             THEN CAST(t.\`amount\` AS DECIMAL(18, 2))
             ELSE 0
           END) AS agg_payout_unsettled
         FROM \`transactions\` t
         WHERE t.\`assigned_agent_id\` IS NOT NULL AND t.\`assigned_agent_id\` > 0
         GROUP BY t.\`assigned_agent_id\`
       ) tx ON tx.agent_id = a.\`id\`
       ORDER BY a.\`id\` DESC
       LIMIT 500`,
    );

    const vendors = rows.map(mapAgent);
    return NextResponse.json({ ok: true as const, rows: vendors });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load dashboard" }, { status: 500 });
  }
}
