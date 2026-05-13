import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COMPANY_COOKIE, verifyCompanySession } from "@/lib/session";

export async function requireCompanySession(): Promise<
  { ok: true; companyId: number; username: string } | { ok: false; response: NextResponse }
> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 }) };
  }
  const token = (await cookies()).get(COMPANY_COOKIE)?.value;
  const session = token ? verifyCompanySession(token, secret) : null;
  if (!session) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, companyId: session.companyId, username: session.username };
}
