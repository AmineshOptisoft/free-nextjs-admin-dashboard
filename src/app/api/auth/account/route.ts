import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import {
  ADMIN_COOKIE,
  AGENT_COOKIE,
  COMPANY_COOKIE,
  verifyAdminSession,
  verifyAgentSession,
  verifyCompanySession,
} from "@/lib/session";

type AdminRow = RowDataPacket & { email: string };
type AgentRow = RowDataPacket & { fullname: string | null; username: string; email: string | null };
type CompanyRow = RowDataPacket & { username: string; brand_name: string | null };

export async function GET() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  const store = await cookies();

  const adminToken = store.get(ADMIN_COOKIE)?.value;
  const adminSess = adminToken ? verifyAdminSession(adminToken, secret) : null;
  if (adminSess) {
    const [rows] = await pool.execute<AdminRow[]>("SELECT `email` FROM `admin` WHERE `admin_id` = ? LIMIT 1", [
      adminSess.adminId,
    ]);
    const row = rows[0];
    const email = row?.email ?? adminSess.email;
    return NextResponse.json({
      ok: true as const,
      role: "admin" as const,
      user: {
        name: email.split("@")[0] || "Admin",
        username: email,
        email,
        phone: "—",
      },
    });
  }

  const agentToken = store.get(AGENT_COOKIE)?.value;
  const agentSess = agentToken ? verifyAgentSession(agentToken, secret) : null;
  if (agentSess) {
    const [rows] = await pool.execute<AgentRow[]>(
      "SELECT `fullname`, `username`, `email` FROM `agents` WHERE `id` = ? LIMIT 1",
      [agentSess.agentId],
    );
    const row = rows[0];
    const username = row?.username ?? agentSess.username;
    const fullname = (row?.fullname ?? "").trim();
    const email = (row?.email ?? "").trim() || "—";
    return NextResponse.json({
      ok: true as const,
      role: "agent" as const,
      user: {
        name: fullname || username,
        username,
        email,
        phone: "—",
      },
    });
  }

  const companyToken = store.get(COMPANY_COOKIE)?.value;
  const companySess = companyToken ? verifyCompanySession(companyToken, secret) : null;
  if (companySess) {
    const [rows] = await pool.execute<CompanyRow[]>(
      "SELECT `username`, `brand_name` FROM `companies` WHERE `id` = ? LIMIT 1",
      [companySess.companyId],
    );
    const row = rows[0];
    const username = row?.username ?? companySess.username;
    const brand = (row?.brand_name ?? "").trim() || username;
    return NextResponse.json({
      ok: true as const,
      role: "company" as const,
      user: {
        name: brand,
        username,
        email: "—",
        phone: "—",
      },
    });
  }

  return NextResponse.json({ ok: false as const, error: "Unauthorized" }, { status: 401 });
}
