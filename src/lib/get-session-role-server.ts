import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  AGENT_COOKIE,
  COMPANY_COOKIE,
  verifyAdminSession,
  verifyAgentSession,
  verifyCompanySession,
} from "@/lib/session";

/** Validated session role from httpOnly cookies (server-only). */
export async function getSessionRole(): Promise<"admin" | "agent" | "company" | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const store = await cookies();
  const adminToken = store.get(ADMIN_COOKIE)?.value;
  if (adminToken && verifyAdminSession(adminToken, secret)) return "admin";

  const agentToken = store.get(AGENT_COOKIE)?.value;
  if (agentToken && verifyAgentSession(agentToken, secret)) return "agent";

  const companyToken = store.get(COMPANY_COOKIE)?.value;
  if (companyToken && verifyCompanySession(companyToken, secret)) return "company";

  return null;
}
