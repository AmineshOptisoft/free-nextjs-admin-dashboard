import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

const STATUSES = new Set(["ACTIVE", "DEACTIVATED", "PENDING", "BLOCKED"]);

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string;
  logo: string | null;
  status: string;
  company_code: string | null;
  commission: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  settlement_amount: string | number;
  settlement_date: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function mapPublic(r: CompanyRow) {
  return {
    id: String(r.id),
    username: r.username,
    brand_name: r.brand_name ?? "",
    logo: r.logo,
    status: r.status,
    company_code: r.company_code,
    commission: num(r.commission),
    net_pay_in: num(r.net_pay_in),
    net_pay_out: num(r.net_pay_out),
    settlement_amount: num(r.settlement_amount),
    settlement_date: r.settlement_date,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

async function getIdParam(context: { params: { id: string } | Promise<{ id: string }> }) {
  return Promise.resolve(context.params);
}

export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await getIdParam(context);
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`, \`commission\`,
            \`net_pay_in\`, \`net_pay_out\`, \`settlement_amount\`, \`settlement_date\`,
            \`created_at\`, \`updated_at\`
     FROM \`companies\` WHERE \`id\` = ? LIMIT 1`,
    [id],
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true as const, company: mapPublic(row) });
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

export async function PATCH(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await getIdParam(context);
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

  if (typeof body.username === "string") {
    const u = body.username.trim();
    if (u) {
      updates.push("`username` = ?");
      values.push(u);
    }
  }

  if (typeof body.brand_name === "string") {
    updates.push("`brand_name` = ?");
    values.push(body.brand_name.trim());
  }

  if (body.logo === null) {
    updates.push("`logo` = NULL");
  } else if (typeof body.logo === "string") {
    updates.push("`logo` = ?");
    values.push(body.logo.trim() || null);
  }

  if (typeof body.company_code === "string") {
    const c = body.company_code.trim();
    updates.push("`company_code` = ?");
    values.push(c || null);
  }

  const comm = parsePctField(body.commission);
  if (comm !== null) {
    updates.push("`commission` = ?");
    values.push(comm);
  }

  if (typeof body.status === "string") {
    const s = body.status.trim().toUpperCase();
    if (STATUSES.has(s)) {
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
      `UPDATE \`companies\` SET ${updates.join(", ")} WHERE \`id\` = ?`,
      values,
    );
    if (header.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "ER_DUP_ENTRY") {
      return NextResponse.json({ ok: false, error: "Username or company code already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }

  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`, \`commission\`,
            \`net_pay_in\`, \`net_pay_out\`, \`settlement_amount\`, \`settlement_date\`,
            \`created_at\`, \`updated_at\`
     FROM \`companies\` WHERE \`id\` = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: true as const, id: String(id) });
  }

  return NextResponse.json({ ok: true as const, company: mapPublic(row) });
}
