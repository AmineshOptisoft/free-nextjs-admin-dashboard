import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-password";
import {
  ADMIN_COOKIE,
  AGENT_COOKIE,
  COMPANY_COOKIE,
  verifyAdminSession,
  verifyAgentSession,
  verifyCompanySession,
} from "@/lib/session";

type HashRow = RowDataPacket & { password: string };

const MIN_LEN = 8;

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const currentRaw = jsonStringOrNumberField(body.current_password);
  const newRaw = jsonStringOrNumberField(body.new_password);
  const confirmRaw = jsonStringOrNumberField(body.confirm_password);

  if (!currentRaw || !newRaw) {
    return NextResponse.json({ ok: false, error: "Current and new password are required" }, { status: 400 });
  }
  if (newRaw.length < MIN_LEN) {
    return NextResponse.json({ ok: false, error: `New password must be at least ${MIN_LEN} characters` }, { status: 400 });
  }
  if (!confirmRaw || newRaw !== confirmRaw) {
    return NextResponse.json({ ok: false, error: "New password and confirmation must match" }, { status: 400 });
  }
  if (currentRaw === newRaw) {
    return NextResponse.json({ ok: false, error: "New password must differ from current password" }, { status: 400 });
  }

  const store = await cookies();

  const adminToken = store.get(ADMIN_COOKIE)?.value;
  const adminSess = adminToken ? verifyAdminSession(adminToken, secret) : null;
  if (adminSess) {
    const [rows] = await pool.execute<HashRow[]>(
      "SELECT `password` FROM `admin` WHERE `admin_id` = ? LIMIT 1",
      [adminSess.adminId],
    );
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
    if (!(await verifyPassword(currentRaw, row.password))) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });
    }
    const nextHash = await hash(newRaw, 10);
    const [upd] = await pool.execute<ResultSetHeader>("UPDATE `admin` SET `password` = ? WHERE `admin_id` = ?", [
      nextHash,
      adminSess.adminId,
    ]);
    if (upd.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Could not update password" }, { status: 500 });
    }
    return NextResponse.json({ ok: true as const });
  }

  const agentToken = store.get(AGENT_COOKIE)?.value;
  const agentSess = agentToken ? verifyAgentSession(agentToken, secret) : null;
  if (agentSess) {
    const [rows] = await pool.execute<HashRow[]>("SELECT `password` FROM `agents` WHERE `id` = ? LIMIT 1", [
      agentSess.agentId,
    ]);
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
    if (!(await verifyPassword(currentRaw, row.password))) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });
    }
    const nextHash = await hash(newRaw, 10);
    const [upd] = await pool.execute<ResultSetHeader>("UPDATE `agents` SET `password` = ? WHERE `id` = ?", [
      nextHash,
      agentSess.agentId,
    ]);
    if (upd.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Could not update password" }, { status: 500 });
    }
    return NextResponse.json({ ok: true as const });
  }

  const companyToken = store.get(COMPANY_COOKIE)?.value;
  const companySess = companyToken ? verifyCompanySession(companyToken, secret) : null;
  if (companySess) {
    const [rows] = await pool.execute<HashRow[]>("SELECT `password` FROM `companies` WHERE `id` = ? LIMIT 1", [
      companySess.companyId,
    ]);
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
    if (!(await verifyPassword(currentRaw, row.password))) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });
    }
    const nextHash = await hash(newRaw, 10);
    const [upd] = await pool.execute<ResultSetHeader>("UPDATE `companies` SET `password` = ? WHERE `id` = ?", [
      nextHash,
      companySess.companyId,
    ]);
    if (upd.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Could not update password" }, { status: 500 });
    }
    return NextResponse.json({ ok: true as const });
  }

  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}
