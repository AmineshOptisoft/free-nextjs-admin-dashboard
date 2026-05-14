import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

const AGENT_STATUSES = new Set(["active", "deactivated", "pending", "blocked"]);

type AgentRow = RowDataPacket & {
  id: number;
  fullname: string | null;
  username: string;
  email: string | null;
  security_deposit: string | number;
  credit_limit: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  previous_balance: string | number;
  running_balance: string | number;
  settlement_amount: string | number;
  settlement_date: number | string | null;
  pay_in_commission: string | number;
  pay_out_commission: string | number;
  referral_commission: string | number;
  referral_code: string | null;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function mapPublic(r: AgentRow) {
  return {
    id: String(r.id),
    fullname: r.fullname,
    username: r.username,
    email: r.email,
    security_deposit: num(r.security_deposit),
    credit_limit: num(r.credit_limit),
    net_pay_in: num(r.net_pay_in),
    net_pay_out: num(r.net_pay_out),
    previous_balance: num(r.previous_balance),
    running_balance: num(r.running_balance),
    settlement_amount: num(r.settlement_amount),
    settlement_date: r.settlement_date,
    pay_in_commission: num(r.pay_in_commission),
    pay_out_commission: num(r.pay_out_commission),
    referral_commission: num(r.referral_commission),
    referral_code: (r.referral_code ?? "").trim(),
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const [rows] = await pool.execute<AgentRow[]>(
    `SELECT \`id\`, \`fullname\`, \`username\`, \`email\`, \`security_deposit\`, \`credit_limit\`,
            \`net_pay_in\`, \`net_pay_out\`, \`previous_balance\`, \`running_balance\`, \`settlement_amount\`, \`settlement_date\`,
            \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`, \`referral_code\`, \`status\`, \`created_at\`, \`updated_at\`
     FROM \`agents\` WHERE \`id\` = ? LIMIT 1`,
    [id],
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true as const, agent: mapPublic(row) });
}

function parsePctField(v: unknown): number | null {
  if (v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(/%/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (typeof body.fullname === "string") {
    updates.push("`fullname` = ?");
    values.push(body.fullname.trim() || null);
  }
  if (typeof body.username === "string") {
    const u = body.username.trim();
    if (u) {
      updates.push("`username` = ?");
      values.push(u);
    }
  }
  if (typeof body.email === "string") {
    updates.push("`email` = ?");
    values.push(body.email.trim() || null);
  }
  if (body.security_deposit !== undefined) {
    const n = Number.parseFloat(jsonStringOrNumberField(body.security_deposit));
    updates.push("`security_deposit` = ?");
    values.push(Number.isFinite(n) ? n : 0);
  }
  if (body.credit_limit !== undefined) {
    const n = Number.parseFloat(jsonStringOrNumberField(body.credit_limit));
    updates.push("`credit_limit` = ?");
    values.push(Number.isFinite(n) ? n : 0);
  }
  const pi = parsePctField(body.pay_in_commission);
  if (pi !== null) {
    updates.push("`pay_in_commission` = ?");
    values.push(pi);
  }
  const po = parsePctField(body.pay_out_commission);
  if (po !== null) {
    updates.push("`pay_out_commission` = ?");
    values.push(po);
  }
  const ref = parsePctField(body.referral_commission);
  if (ref !== null) {
    updates.push("`referral_commission` = ?");
    values.push(ref);
  }
  if (typeof body.status === "string") {
    const s = body.status.trim().toLowerCase();
    if (AGENT_STATUSES.has(s)) {
      updates.push("`status` = ?");
      values.push(s);
    }
  }

  const pwd = jsonStringOrNumberField(body.password);
  if (pwd) {
    updates.push("`password` = ?");
    values.push(await hash(pwd, 10));
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  values.push(id);

  try {
    const [header] = await pool.execute<ResultSetHeader>(
      `UPDATE \`agents\` SET ${updates.join(", ")} WHERE \`id\` = ?`,
      values,
    );
    if (header.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "ER_DUP_ENTRY") {
      return NextResponse.json({ ok: false, error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }

  const [rows] = await pool.execute<AgentRow[]>(
    `SELECT \`id\`, \`fullname\`, \`username\`, \`email\`, \`security_deposit\`, \`credit_limit\`,
            \`net_pay_in\`, \`net_pay_out\`, \`previous_balance\`, \`running_balance\`, \`settlement_amount\`, \`settlement_date\`,
            \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`, \`referral_code\`, \`status\`, \`created_at\`, \`updated_at\`
     FROM \`agents\` WHERE \`id\` = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: true as const, id: String(id) });
  }

  return NextResponse.json({ ok: true as const, agent: mapPublic(row) });
}
