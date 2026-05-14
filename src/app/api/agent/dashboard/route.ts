import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { AGENT_SETTLED_LEDGER_SQL_IN } from "@/lib/agent-ledger-statuses";
import { pool } from "@/lib/db";
import { requireAgentSession } from "@/lib/require-agent-api";

type AgentRow = RowDataPacket & {
  security_deposit: string | number;
  credit_limit: string | number;
  previous_balance: string | number;
  running_balance: string | number;
  settlement_amount: string | number;
  pay_in_commission: string | number;
  pay_out_commission: string | number;
};

type TxAgg = RowDataPacket & {
  type: "PAYIN" | "PAYOUT";
  total_amount: string | number | null;
  total_count: number;
  success_amount: string | number | null;
  success_count: number;
  failed_amount: string | number | null;
  failed_count: number;
  today_count: number;
  today_amount: string | number | null;
};

type MethodsAgg = RowDataPacket & {
  active_methods: number;
  payin_enabled: number;
  payout_enabled: number;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

const SUCCESS_IN = AGENT_SETTLED_LEDGER_SQL_IN;
const FAILED_IN = `('REJECTED','REVOKED','EXPIRED','NOT_ASSIGNED')`;

export async function GET() {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  try {
    const [agentRows] = await pool.execute<AgentRow[]>(
      `SELECT \`security_deposit\`, \`credit_limit\`, \`previous_balance\`, \`running_balance\`, \`settlement_amount\`,
              \`pay_in_commission\`, \`pay_out_commission\`
       FROM \`agents\` WHERE \`id\` = ? LIMIT 1`,
      [auth.agentId],
    );
    const a = agentRows[0];
    if (!a) return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });

    const [txRows] = await pool.execute<TxAgg[]>(
      `SELECT
         \`type\`,
         SUM(\`amount\`) AS total_amount,
         COUNT(*) AS total_count,
         SUM(CASE WHEN \`status\` IN ${SUCCESS_IN} THEN \`amount\` ELSE 0 END) AS success_amount,
         SUM(CASE WHEN \`status\` IN ${SUCCESS_IN} THEN 1 ELSE 0 END) AS success_count,
         SUM(CASE WHEN \`status\` IN ${FAILED_IN} THEN \`amount\` ELSE 0 END) AS failed_amount,
         SUM(CASE WHEN \`status\` IN ${FAILED_IN} THEN 1 ELSE 0 END) AS failed_count,
         SUM(CASE WHEN DATE(\`created_at\`) = CURRENT_DATE THEN 1 ELSE 0 END) AS today_count,
         SUM(CASE WHEN DATE(\`created_at\`) = CURRENT_DATE THEN \`amount\` ELSE 0 END) AS today_amount
       FROM \`transactions\`
       WHERE \`assigned_agent_id\` = ?
       GROUP BY \`type\``,
      [auth.agentId],
    );

    const payin = txRows.find((r) => r.type === "PAYIN");
    const payout = txRows.find((r) => r.type === "PAYOUT");

    const [methodRows] = await pool.execute<MethodsAgg[]>(
      `SELECT
         SUM(CASE WHEN \`status\` = 'ACTIVE' THEN 1 ELSE 0 END) AS active_methods,
         SUM(CASE WHEN \`enable_pay_in\` = 1 THEN 1 ELSE 0 END) AS payin_enabled,
         SUM(CASE WHEN \`enable_pay_out\` = 1 THEN 1 ELSE 0 END) AS payout_enabled
       FROM \`pay_methods\`
       WHERE \`agent_id\` = ?`,
      [auth.agentId],
    );
    const m = methodRows[0] ?? { active_methods: 0, payin_enabled: 0, payout_enabled: 0 };

    return NextResponse.json({
      ok: true as const,
      metrics: {
        total_payin_amount: num(payin?.total_amount),
        success_payin_amount: num(payin?.success_amount),
        failed_payin_amount: num(payin?.failed_amount),
        net_settlement: num(payin?.success_amount) - num(payout?.success_amount),
        payin_txn_count: payin?.total_count ?? 0,
        payin_success_count: payin?.success_count ?? 0,
        payin_failed_count: payin?.failed_count ?? 0,
      },
      operations: {
        security_deposit: num(a.security_deposit),
        credit_limit: num(a.credit_limit),
        previous_balance: num(a.previous_balance),
        running_balance: num(a.running_balance),
        settlement_amount: num(a.settlement_amount),
        payin_commission: num(a.pay_in_commission),
        payout_commission: num(a.pay_out_commission),
        today_payin_ops: payin?.today_count ?? 0,
        today_payout_ops: payout?.today_count ?? 0,
        today_payin_amount: num(payin?.today_amount),
        today_payout_amount: num(payout?.today_amount),
        active_methods: m.active_methods ?? 0,
        payin_enabled_methods: m.payin_enabled ?? 0,
        payout_enabled_methods: m.payout_enabled ?? 0,
      },
    });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "ER_BAD_FIELD_ERROR") {
      return NextResponse.json(
        { ok: false, error: "Database columns mismatch. Run database/migrations/002_rename_transactions_columns.sql." },
        { status: 503 },
      );
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not load dashboard" }, { status: 500 });
  }
}
