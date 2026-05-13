import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { canCompanyEditOrDelete } from "@/lib/payout-lifecycle";
import { requireCompanySession } from "@/lib/require-company-api";

type TxRow = RowDataPacket & {
  id: number;
  order_id: string;
  amount: string | number;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  created_at: Date | string | null;
  user_note: string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function mapRow(r: TxRow) {
  const created = r.created_at ? new Date(r.created_at as string | Date).toISOString() : undefined;
  return {
    id: String(r.id),
    orderId: r.order_id,
    amount: num(r.amount),
    status: r.status,
    clientName: r.client_name ?? "",
    clientUpi: r.client_upi ?? "",
    bankName: r.bank_name ?? "",
    accountNo: r.bank_account_number ?? "",
    ifsc: r.ifsc_code ?? "",
    createdAtIso: created,
    remarks: r.user_note ?? "",
  };
}

async function loadOwned(companyId: number, id: number): Promise<TxRow | null> {
  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`order_id\`, \`amount\`, \`status\`, \`client_name\`, \`client_upi\`,
            \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`created_at\`, \`user_note\`
     FROM \`transactions\` WHERE \`id\` = ? AND \`company_id\` = ? AND \`type\` = 'PAYOUT' LIMIT 1`,
    [id, companyId],
  );
  return rows[0] ?? null;
}

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const existing = await loadOwned(auth.companyId, id);
  if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (!canCompanyEditOrDelete(existing.status)) {
    return NextResponse.json({ ok: false, error: "Only pending/unassigned payout can be edited" }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.amount !== undefined) {
    const amount = Number.parseFloat(jsonStringOrNumberField(body.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Valid amount required" }, { status: 400 });
    }
    updates.push("`amount` = ?");
    params.push(amount);
  }
  if (typeof body.client_name === "string") {
    updates.push("`client_name` = ?");
    params.push(body.client_name.trim());
    updates.push("`account_holder_name` = ?");
    params.push(body.client_name.trim());
  }
  if (typeof body.client_upi === "string") {
    updates.push("`client_upi` = ?");
    params.push(body.client_upi.trim());
  }
  if (typeof body.bank_name === "string") {
    updates.push("`bank_name` = ?");
    params.push(body.bank_name.trim());
  }
  if (typeof body.bank_account_number === "string") {
    updates.push("`bank_account_number` = ?");
    params.push(body.bank_account_number.trim());
  }
  if (typeof body.ifsc_code === "string") {
    updates.push("`ifsc_code` = ?");
    params.push(body.ifsc_code.trim());
  }
  if (typeof body.user_note === "string") {
    updates.push("`user_note` = NULLIF(?, '')");
    params.push(body.user_note.trim());
  }

  if (updates.length === 0) return NextResponse.json({ ok: true as const, payout: mapRow(existing) });

  params.push(id, auth.companyId);
  await pool.execute<ResultSetHeader>(
    `UPDATE \`transactions\` SET ${updates.join(", ")} WHERE \`id\` = ? AND \`company_id\` = ? AND \`type\` = 'PAYOUT'`,
    params as (string | number | null)[],
  );

  const row = await loadOwned(auth.companyId, id);
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true as const, payout: mapRow(row) });
}

export async function DELETE(_req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const row = await loadOwned(auth.companyId, id);
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (!canCompanyEditOrDelete(row.status)) {
    return NextResponse.json({ ok: false, error: "Only pending/unassigned payout can be deleted" }, { status: 409 });
  }

  const [res] = await pool.execute<ResultSetHeader>(
    "DELETE FROM `transactions` WHERE `id` = ? AND `company_id` = ? AND `type` = 'PAYOUT'",
    [id, auth.companyId],
  );
  if (res.affectedRows === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true as const });
}
