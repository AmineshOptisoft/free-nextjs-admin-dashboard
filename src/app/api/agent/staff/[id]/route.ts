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

async function getOwnedPayMethod(agentId: number, id: number): Promise<PayMethodRow | null> {
  const [rows] = await pool.execute<PayMethodRow[]>(
    `SELECT ${PAY_METHOD_SELECT}
     FROM \`pay_methods\` WHERE \`id\` = ? AND \`agent_id\` = ? LIMIT 1`,
    [id, agentId],
  );
  return rows[0] ?? null;
}

function opTypeToFlags(op: string): { in: boolean; out: boolean } {
  const t = op.trim();
  if (t === "PayIn Only") return { in: true, out: false };
  if (t === "PayOut Only") return { in: false, out: true };
  return { in: true, out: true };
}

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const rowId = Number(idRaw);
  if (!Number.isInteger(rowId) || rowId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await getOwnedPayMethod(auth.agentId, rowId);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (typeof body.fullname === "string") {
      updates.push("`full_name` = ?");
      params.push(body.fullname.trim() || existing.full_name);
    }
    if (typeof body.email === "string") {
      updates.push("`email` = NULLIF(?, '')");
      params.push(body.email.trim());
    }

    let nextIn: boolean | undefined;
    let nextOut: boolean | undefined;
    if (typeof body.operation_type === "string") {
      const f = opTypeToFlags(body.operation_type);
      nextIn = f.in;
      nextOut = f.out;
    }
    if (typeof body.pay_in_enabled === "boolean") nextIn = body.pay_in_enabled;
    if (typeof body.pay_out_enabled === "boolean") nextOut = body.pay_out_enabled;
    if (nextIn !== undefined) {
      updates.push("`enable_pay_in` = ?");
      params.push(nextIn ? 1 : 0);
    }
    if (nextOut !== undefined) {
      updates.push("`enable_pay_out` = ?");
      params.push(nextOut ? 1 : 0);
    }
    if (typeof body.gateway === "string") {
      const pm = gatewayToPaymentMethod(body.gateway.trim());
      updates.push("`payment_method` = ?");
      params.push(pm);
      if (pm === "UPI") {
        updates.push("`account_no` = NULL", "`ifsc_code` = NULL", "`branch_name` = NULL", "`bank_name` = NULL");
      } else {
        updates.push("`upi_id` = NULL");
      }
    }
    if (typeof body.upi_id === "string") {
      updates.push("`upi_id` = NULLIF(?, '')");
      params.push(body.upi_id.trim());
    }
    if (typeof body.bank_name === "string") {
      updates.push("`bank_name` = NULLIF(?, '')");
      params.push(body.bank_name.trim());
    }
    if (typeof body.account_no === "string") {
      updates.push("`account_no` = NULLIF(?, '')");
      params.push(body.account_no.trim());
    }
    if (typeof body.ifsc_code === "string") {
      updates.push("`ifsc_code` = NULLIF(?, '')");
      params.push(body.ifsc_code.trim());
    }
    if (typeof body.branch_name === "string") {
      updates.push("`branch_name` = NULLIF(?, '')");
      params.push(body.branch_name.trim());
    }
    if (typeof body.account_holder_name === "string") {
      updates.push("`account_holder_name` = NULLIF(?, '')");
      params.push(body.account_holder_name.trim());
    }
    if (body.status === "active" || body.status === "inactive") {
      updates.push("`status` = ?");
      params.push(body.status === "active" ? "ACTIVE" : "INACTIVE");
    }

    const newUsername = typeof body.username === "string" ? body.username.trim() : "";
    if (newUsername && newUsername !== (existing.username ?? "").trim()) {
      updates.push("`username` = ?");
      params.push(newUsername);
    }

    if (updates.length === 0) {
      const fin0 = await loadPayMethodFinancials(auth.agentId, [rowId]);
      return NextResponse.json({
        ok: true as const,
        payment_method: payMethodToStaffApi(existing, auth.username, fin0.get(rowId)),
      });
    }

    params.push(rowId, auth.agentId);

    try {
      await pool.execute<ResultSetHeader>(
        `UPDATE \`pay_methods\` SET ${updates.join(", ")} WHERE \`id\` = ? AND \`agent_id\` = ?`,
        params as (string | number | boolean | null)[],
      );
    } catch (e: unknown) {
      if (isMysqlErNoSuchTable(e)) {
        return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "Could not update payment method" }, { status: 500 });
    }

    const row = await getOwnedPayMethod(auth.agentId, rowId);
    if (!row) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    const fin = await loadPayMethodFinancials(auth.agentId, [rowId]);
    return NextResponse.json({ ok: true as const, payment_method: payMethodToStaffApi(row, auth.username, fin.get(rowId)) });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not update payment method" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const rowId = Number(idRaw);
  if (!Number.isInteger(rowId) || rowId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM `pay_methods` WHERE `id` = ? AND `agent_id` = ?",
      [rowId, auth.agentId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true as const });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not delete payment method" }, { status: 500 });
  }
}
