import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { emitTransactionRealtime } from "@/lib/realtime/broadcast-transaction";
import { requireAgentSession } from "@/lib/require-agent-api";
import { sqlExpiresAtFromNow } from "@/lib/request-expiry";

type PayMethodRow = RowDataPacket & {
  id: number;
  agent_id: number;
  upi_id: string | null;
  payment_method: string;
  bank_name: string | null;
  account_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  account_holder_name: string | null;
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

/**
 * Agent creates a PAYIN already bound to one of their pay_methods (no company link).
 */
export async function POST(req: Request) {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const amount = Number.parseFloat(jsonStringOrNumberField(body.amount));
  const clientName = typeof body.client_name === "string" ? body.client_name.trim() : "";
  const clientUpi = typeof body.client_upi === "string" ? body.client_upi.trim() : "";
  const payMethodId = Number(body.pay_method_id);
  const note = typeof body.user_note === "string" ? body.user_note.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Valid amount required" }, { status: 400 });
  }
  if (!clientName) {
    return NextResponse.json({ ok: false, error: "client_name is required" }, { status: 400 });
  }
  if (!Number.isInteger(payMethodId) || payMethodId < 1) {
    return NextResponse.json({ ok: false, error: "pay_method_id is required" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [pmRows] = await conn.execute<PayMethodRow[]>(
      `SELECT \`id\`, \`agent_id\`, \`upi_id\`, \`payment_method\`, \`bank_name\`, \`account_no\`, \`ifsc_code\`, \`branch_name\`, \`account_holder_name\`
       FROM \`pay_methods\`
       WHERE \`id\` = ? AND \`agent_id\` = ? AND \`status\` = 'ACTIVE' AND \`enable_pay_in\` = 1
       FOR UPDATE`,
      [payMethodId, auth.agentId],
    );
    const pm = pmRows[0];
    if (!pm) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Invalid pay method for this agent" }, { status: 400 });
    }

    const [inc] = await conn.execute<ResultSetHeader>(
      `UPDATE \`pay_methods\`
       SET \`today_total_pay_in_amount\` = \`today_total_pay_in_amount\` + ?
       WHERE \`id\` = ? AND \`agent_id\` = ? AND \`status\` = 'ACTIVE' AND \`enable_pay_in\` = 1
         AND (\`pay_in_limit\` <= 0 OR (\`today_total_pay_in_amount\` + ?) <= \`pay_in_limit\`)`,
      [amount, payMethodId, auth.agentId, amount],
    );
    if (inc.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Pay-in limit reached on this account" }, { status: 409 });
    }

    const randomCode = randomUUID().replace(/-/g, "").slice(0, 20);
    const orderId = `PI${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const payeeLabel =
      (pm.account_holder_name && String(pm.account_holder_name).trim()) || clientName || "Payee";
    const qr =
      String(pm.payment_method).toUpperCase() === "UPI" && pm.upi_id
        ? buildUpiPayload(String(pm.upi_id), payeeLabel, amount)
        : null;

    const [ins] = await conn.execute<ResultSetHeader>(
      `INSERT INTO \`transactions\` (
        \`random_code\`, \`type\`, \`order_id\`, \`amount\`, \`currency\`, \`payment_method\`,
        \`status\`, \`client_name\`, \`client_upi\`, \`company_id\`,
        \`pay_method_id\`, \`assigned_agent_id\`, \`assigned_upi\`,
        \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`branch_name\`, \`account_holder_name\`,
        \`assigned_by\`, \`qr_code_url\`, \`assigned_date\`, \`user_note\`, \`expires_at\`
      ) VALUES (
        ?, 'PAYIN', ?, ?, 'INR', ?, 'PENDING', ?, ?, NULL,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, NOW(), NULLIF(?, ''), ${sqlExpiresAtFromNow()}
      )`,
      [
        randomCode,
        orderId,
        amount,
        pm.payment_method,
        clientName,
        clientUpi || clientName,
        payMethodId,
        auth.agentId,
        pm.upi_id,
        pm.bank_name ?? null,
        pm.account_no ?? null,
        pm.ifsc_code ?? null,
        pm.branch_name ?? null,
        pm.account_holder_name ?? null,
        payMethodId,
        qr,
        note,
      ],
    );

    await conn.commit();
    const id = Number(ins.insertId);
    emitTransactionRealtime(id, "create");
    return NextResponse.json({
      ok: true as const,
      id: String(id),
      orderId,
      status: "PENDING",
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
