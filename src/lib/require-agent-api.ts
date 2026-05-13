import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AGENT_COOKIE, verifyAgentSession } from "@/lib/session";

export async function requireAgentSession(): Promise<
  { ok: true; agentId: number; username: string } | { ok: false; response: NextResponse }
> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 }) };
  }
  const token = (await cookies()).get(AGENT_COOKIE)?.value;
  const session = token ? verifyAgentSession(token, secret) : null;
  if (!session) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, agentId: session.agentId, username: session.username };
}
