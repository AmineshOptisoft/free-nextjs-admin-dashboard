import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import {
  gatewayToPaymentMethod,
  PAY_METHOD_SELECT,
  payMethodToStaffApi,
  type PayMethodRow,
} from "@/lib/agent-payment-method-map";
import { pool } from "@/lib/db";
import { isMysqlErNoSuchTable, PAY_METHODS_TABLE_HINT } from "@/lib/mysql-table-error";
import { requireAgentSession } from "@/lib/require-agent-api";
import { loadPayMethodFinancials } from "@/lib/transactions-pay-method-financials";

export async function GET() {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<PayMethodRow[]>(
      `SELECT ${PAY_METHOD_SELECT}
       FROM \`pay_methods\` WHERE \`agent_id\` = ? ORDER BY \`id\` DESC`,
      [auth.agentId],
    );

    const ids = rows.map((r) => r.id);
    const financialByPm = await loadPayMethodFinancials(auth.agentId, ids);
    const staff = rows.map((r) => payMethodToStaffApi(r, auth.username, financialByPm.get(r.id)));
    return NextResponse.json({ ok: true as const, staff });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not load payment methods" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const username = jsonStringOrNumberField(body.username)?.trim();
  const fullname = typeof body.fullname === "string" ? body.fullname.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const payIn = Boolean(body.pay_in_enabled);
  const payOut = Boolean(body.pay_out_enabled);
  const gateway = typeof body.gateway === "string" ? body.gateway.trim() : "UPI & Bank Transfer";
  const paymentMethod = gatewayToPaymentMethod(gateway);

  if (!username) {
    return NextResponse.json({ ok: false, error: "Username is required" }, { status: 400 });
  }

  const fullNameDb = fullname || username;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO \`pay_methods\` (
        \`agent_id\`, \`full_name\`, \`username\`, \`email\`, \`upi_id\`, \`payment_method\`,
        \`account_no\`, \`ifsc_code\`, \`branch_name\`, \`bank_name\`, \`account_holder_name\`,
        \`pay_in_limit\`, \`pay_out_limit\`, \`enable_pay_in\`, \`enable_pay_out\`, \`status\`,
        \`today_total_pay_in_amount\`, \`today_total_pay_out_amount\`, \`last_activity\`
      ) VALUES (
        ?, ?, ?, NULLIF(?, ''), NULL, ?,
        NULL, NULL, NULL, NULL, NULL,
        0, 0, ?, ?, 'ACTIVE',
        0, 0, NOW()
      )`,
      [auth.agentId, fullNameDb, username, email, paymentMethod, payIn ? 1 : 0, payOut ? 1 : 0],
    );

    const id = result.insertId;
    const [rows] = await pool.execute<PayMethodRow[]>(
      `SELECT ${PAY_METHOD_SELECT} FROM \`pay_methods\` WHERE \`id\` = ? AND \`agent_id\` = ? LIMIT 1`,
      [id, auth.agentId],
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ ok: false, error: "Could not load created row" }, { status: 500 });
    }
    const fin = await loadPayMethodFinancials(auth.agentId, [id]);
    return NextResponse.json({ ok: true as const, staff: payMethodToStaffApi(row, auth.username, fin.get(id)) });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not create payment method" }, { status: 500 });
  }
}
