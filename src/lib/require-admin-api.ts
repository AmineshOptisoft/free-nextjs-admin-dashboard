import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/session";

export async function requireAdminSession(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 }) };
  }
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = token ? verifyAdminSession(token, secret) : null;
  if (!session) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true };
}
