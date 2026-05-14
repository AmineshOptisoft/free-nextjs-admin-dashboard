import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import {
  gatewayToPaymentMethod,
  PAY_METHOD_SELECT,
  payMethodToStaffApi,
  type PayMethodRow,
} from "@/lib/agent-payment-method-map";
import { validateAgentPayMethodPayload } from "@/lib/agent-pay-method-limits";
import { pool } from "@/lib/db";
import { isMysqlErNoSuchTable, PAY_METHODS_TABLE_HINT } from "@/lib/mysql-table-error";
import { requireAgentSession } from "@/lib/require-agent-api";
import { loadPayMethodFinancials } from "@/lib/transactions-pay-method-financials";

function parseMoneyLimit(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v).trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 1e16);
}

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
    const payment_methods = rows.map((r) => payMethodToStaffApi(r, auth.username, financialByPm.get(r.id)));
    return NextResponse.json({ ok: true as const, payment_methods });
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
  const gateway = typeof body.gateway === "string" ? body.gateway.trim() : "UPI Only";
  const paymentMethod = gatewayToPaymentMethod(gateway);

  const upiId = typeof body.upi_id === "string" ? body.upi_id.trim() : "";
  const bankName = typeof body.bank_name === "string" ? body.bank_name.trim() : "";
  const accountNo = typeof body.account_no === "string" ? body.account_no.trim() : "";
  const ifscCode = typeof body.ifsc_code === "string" ? body.ifsc_code.trim() : "";
  const branchName = typeof body.branch_name === "string" ? body.branch_name.trim() : "";
  const accountHolder = typeof body.account_holder_name === "string" ? body.account_holder_name.trim() : "";
  const payInLimit = parseMoneyLimit(body.pay_in_limit);
  const payOutLimit = parseMoneyLimit(body.pay_out_limit);

  if (!username) {
    return NextResponse.json({ ok: false, error: "Username is required" }, { status: 400 });
  }

  if (paymentMethod === "UPI") {
    if (!upiId) {
      return NextResponse.json({ ok: false, error: "UPI ID is required for UPI payment methods" }, { status: 400 });
    }
  } else {
    if (!bankName || !accountNo || !ifscCode || !accountHolder) {
      return NextResponse.json(
        { ok: false, error: "Bank name, account number, IFSC, and account holder name are required for bank payment methods" },
        { status: 400 },
      );
    }
  }

  const mergedPm = paymentMethod === "BANK" ? "BANK" : "UPI";
  const limErr = validateAgentPayMethodPayload({
    paymentMethod: mergedPm,
    payInEnabled: payIn,
    payOutEnabled: payOut,
    payInLimit,
    payOutLimit,
    upiId,
  });
  if (limErr) {
    return NextResponse.json({ ok: false, error: limErr }, { status: 400 });
  }

  const fullNameDb = fullname || username;

  const upiDb = paymentMethod === "UPI" ? upiId : null;
  const holderDb = paymentMethod === "UPI" ? (accountHolder || null) : accountHolder;
  const bankNameDb = paymentMethod === "BANK" ? bankName : null;
  const accountNoDb = paymentMethod === "BANK" ? accountNo : null;
  const ifscDb = paymentMethod === "BANK" ? ifscCode : null;
  const branchDb = paymentMethod === "BANK" ? (branchName || null) : null;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO \`pay_methods\` (
        \`agent_id\`, \`full_name\`, \`username\`, \`email\`, \`upi_id\`, \`payment_method\`,
        \`account_no\`, \`ifsc_code\`, \`branch_name\`, \`bank_name\`, \`account_holder_name\`,
        \`pay_in_limit\`, \`pay_out_limit\`, \`enable_pay_in\`, \`enable_pay_out\`, \`status\`,
        \`today_total_pay_in_amount\`, \`today_total_pay_out_amount\`, \`last_activity\`
      ) VALUES (
        ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?,
        NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''),
        ?, ?, ?, ?, 'ACTIVE',
        0, 0, NOW()
      )`,
      [
        auth.agentId,
        fullNameDb,
        username,
        email,
        upiDb,
        paymentMethod,
        accountNoDb,
        ifscDb,
        branchDb,
        bankNameDb,
        holderDb,
        payInLimit,
        payOutLimit,
        payIn ? 1 : 0,
        payOut ? 1 : 0,
      ],
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
    return NextResponse.json({ ok: true as const, payment_method: payMethodToStaffApi(row, auth.username, fin.get(id)) });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not create payment method" }, { status: 500 });
  }
}
