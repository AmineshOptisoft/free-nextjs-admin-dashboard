import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
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
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/** One dashboard row — DB-backed fields filled; unknown metrics are 0 (never omitted). */
function mapAgent(r: AgentRow) {
  const security = num(r.security_deposit);
  const credit = num(r.credit_limit);
  const netPayIn = num(r.net_pay_in);
  const payout = num(r.net_pay_out);
  const prevBalance = num(r.previous_balance);
  const running = num(r.running_balance);
  const settlement = num(r.settlement_amount);
  const commission = num(r.referral_commission);
  const net = netPayIn - payout;
  const finalBalance = running - security;

  return {
    id: String(r.id),
    name: (r.fullname && r.fullname.trim()) || r.username,
    security,
    manualPayIn: 0,
    approvedPayIn: 0,
    discounted: 0,
    netPayIn,
    payout,
    unsettlePayout: 0,
    settlement,
    net,
    prevBalance,
    commission,
    running,
    runningUnsettled: 0,
    credit,
    finalBalance,
    remainingBalance: Math.abs(finalBalance),
  };
}

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<AgentRow[]>(
      `SELECT \`id\`, \`fullname\`, \`username\`, \`security_deposit\`, \`credit_limit\`,
              \`net_pay_in\`, \`net_pay_out\`, \`previous_balance\`, \`running_balance\`, \`settlement_amount\`,
              \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`
       FROM \`agents\` ORDER BY \`id\` DESC LIMIT 500`,
    );

    const vendors = rows.map(mapAgent);
    return NextResponse.json({ ok: true as const, rows: vendors });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load dashboard" }, { status: 500 });
  }
}
