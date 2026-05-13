import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  AGENT_COOKIE,
  COMPANY_COOKIE,
  verifyAdminSession,
  verifyAgentSession,
  verifyCompanySession,
} from "@/lib/session";

export async function GET() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  const store = await cookies();
  const adminToken = store.get(ADMIN_COOKIE)?.value;
  if (adminToken && verifyAdminSession(adminToken, secret)) {
    return NextResponse.json({ ok: true as const, role: "admin" as const });
  }

  const agentToken = store.get(AGENT_COOKIE)?.value;
  if (agentToken && verifyAgentSession(agentToken, secret)) {
    return NextResponse.json({ ok: true as const, role: "agent" as const });
  }

  const companyToken = store.get(COMPANY_COOKIE)?.value;
  if (companyToken && verifyCompanySession(companyToken, secret)) {
    return NextResponse.json({ ok: true as const, role: "company" as const });
  }

  return NextResponse.json({ ok: false as const, role: null }, { status: 401 });
}
