import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { tryAssignPayInTransaction, deleteNotAssignedPayIn, PAYIN_NO_ELIGIBLE_AGENT_MESSAGE } from "@/lib/payin-assignment";
import { requireCompanySession } from "@/lib/require-company-api";

type TxRow = RowDataPacket & {
  id: number;
  assigned_agent_id: number | null;
  order_id: string;
  amount: string | number;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  assigned_upi: string | null;
  utr_code: string | null;
  payment_image: string | null;
  created_at: Date | string | null;
  user_note: string | null;
  assigned_date: Date | string | null;
  agent_fullname: string | null;
  agent_username: string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function agentLabel(full: string | null, user: string | null): string {
  const u = (user ?? "").trim();
  if (!u) return "—";
  const f = (full ?? "").trim();
  return f ? `${f} (${u})` : u;
}

function mapRow(r: TxRow) {
  const created = r.created_at ? new Date(r.created_at as string | Date).toISOString() : undefined;
  const assignedAt = r.assigned_date ? new Date(r.assigned_date as string | Date).toISOString() : undefined;
  const label = agentLabel(r.agent_fullname, r.agent_username);
  const aid = r.assigned_agent_id != null && Number(r.assigned_agent_id) > 0 ? String(r.assigned_agent_id) : null;
  return {
    id: String(r.id),
    orderId: r.order_id,
    amount: num(r.amount),
    status: r.status,
    clientName: r.client_name ?? "",
    clientUpi: r.client_upi ?? "",
    assignedUpi: r.assigned_upi ?? "",
    utrCode: r.utr_code ?? "",
    hasReceipt: Boolean(r.payment_image && String(r.payment_image).trim().length > 0),
    createdAtIso: created,
    remarks: r.user_note ?? "",
    assignedAtIso: assignedAt,
    assignedToLabel: label,
    assignedAgentName: label !== "—" ? label : undefined,
    assignedAgentId: aid,
  };
}

export async function GET(req: Request) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 500) : 200;

  let sql = `
    SELECT t.\`id\`, t.\`order_id\`, t.\`amount\`, t.\`status\`, t.\`client_name\`, t.\`client_upi\`,
           t.\`assigned_upi\`, t.\`utr_code\`, t.\`payment_image\`, t.\`created_at\`, t.\`user_note\`,
           t.\`assigned_date\`, t.\`assigned_agent_id\`,
           a.\`fullname\` AS \`agent_fullname\`, a.\`username\` AS \`agent_username\`
    FROM \`transactions\` t
    LEFT JOIN \`agents\` a ON a.\`id\` = t.\`assigned_agent_id\`
    WHERE t.\`company_id\` = ? AND t.\`type\` = 'PAYIN'
  `;
  const params: (number | string)[] = [auth.companyId];
  if (status) {
    sql += " AND t.`status` = ? ";
    params.push(status);
  }
  sql += " ORDER BY t.`id` DESC LIMIT " + String(limit);

  const [rows] = await pool.execute<TxRow[]>(sql, params);
  return NextResponse.json({ ok: true as const, payins: rows.map(mapRow) });
}

export async function POST(req: Request) {
  const auth = await requireCompanySession();
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
  const note = typeof body.user_note === "string" ? body.user_note.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Valid amount required" }, { status: 400 });
  }
  if (!clientName || !clientUpi) {
    return NextResponse.json({ ok: false, error: "client_name and client_upi are required" }, { status: 400 });
  }

  const randomCode = randomUUID().replace(/-/g, "").slice(0, 20);
  const orderId = `PI${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const [res] = await pool.execute<ResultSetHeader>(
    `INSERT INTO \`transactions\` (
      \`random_code\`, \`type\`, \`order_id\`, \`amount\`, \`currency\`, \`payment_method\`,
      \`status\`, \`client_name\`, \`client_upi\`, \`company_id\`, \`user_note\`
    ) VALUES (?, 'PAYIN', ?, ?, 'INR', 'UPI', 'NOT_ASSIGNED', ?, ?, ?, NULLIF(?, ''))`,
    [randomCode, orderId, amount, clientName, clientUpi, auth.companyId, note],
  );

  const insertId = Number(res.insertId);
  try {
    await tryAssignPayInTransaction(insertId, amount);
  } catch {
    await deleteNotAssignedPayIn(insertId);
    return NextResponse.json({ ok: false as const, error: PAYIN_NO_ELIGIBLE_AGENT_MESSAGE }, { status: 503 });
  }

  const [rows] = await pool.execute<TxRow[]>(
    `SELECT t.\`id\`, t.\`order_id\`, t.\`amount\`, t.\`status\`, t.\`client_name\`, t.\`client_upi\`,
            t.\`assigned_upi\`, t.\`utr_code\`, t.\`payment_image\`, t.\`created_at\`, t.\`user_note\`,
            t.\`assigned_date\`, t.\`assigned_agent_id\`,
            a.\`fullname\` AS \`agent_fullname\`, a.\`username\` AS \`agent_username\`
     FROM \`transactions\` t
     LEFT JOIN \`agents\` a ON a.\`id\` = t.\`assigned_agent_id\`
     WHERE t.\`id\` = ? AND t.\`company_id\` = ? LIMIT 1`,
    [insertId, auth.companyId],
  );
  const row = rows[0];
  if (!row) {
    await deleteNotAssignedPayIn(insertId);
    return NextResponse.json({ ok: false, error: "Could not load created payin" }, { status: 500 });
  }
  if (String(row.status).toUpperCase() === "NOT_ASSIGNED") {
    await deleteNotAssignedPayIn(insertId);
    return NextResponse.json({ ok: false as const, error: PAYIN_NO_ELIGIBLE_AGENT_MESSAGE }, { status: 503 });
  }

  return NextResponse.json({
    ok: true as const,
    payin: mapRow(row),
    assignment: "ASSIGNED",
    message: "PayIn request created and assigned. Share assigned payment details with the client.",
  });
}
