import {
  ADMIN_COOKIE,
  AGENT_COOKIE,
  COMPANY_COOKIE,
  verifyAdminSession,
  verifyAgentSession,
  verifyCompanySession,
} from "@/lib/session";

export type SocketAuth =
  | { role: "admin"; adminId: number }
  | { role: "agent"; agentId: number }
  | { role: "company"; companyId: number };

function parseCookieHeader(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const key = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

export function authenticateSocket(cookieHeader: string | undefined): SocketAuth | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const cookies = parseCookieHeader(cookieHeader);

  const adminToken = cookies[ADMIN_COOKIE];
  if (adminToken) {
    const sess = verifyAdminSession(adminToken, secret);
    if (sess) return { role: "admin", adminId: sess.adminId };
  }

  const agentToken = cookies[AGENT_COOKIE];
  if (agentToken) {
    const sess = verifyAgentSession(agentToken, secret);
    if (sess) return { role: "agent", agentId: sess.agentId };
  }

  const companyToken = cookies[COMPANY_COOKIE];
  if (companyToken) {
    const sess = verifyCompanySession(companyToken, secret);
    if (sess) return { role: "company", companyId: sess.companyId };
  }

  return null;
}

export function roomForAuth(auth: SocketAuth): string {
  if (auth.role === "admin") return "role:admin";
  if (auth.role === "agent") return `role:agent:${auth.agentId}`;
  return `role:company:${auth.companyId}`;
}
