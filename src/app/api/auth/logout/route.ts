import { NextResponse } from "next/server";
import { ADMIN_COOKIE, AGENT_COOKIE, COMPANY_COOKIE } from "@/lib/session";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(AGENT_COOKIE, "", cookieOpts);
  res.cookies.set(COMPANY_COOKIE, "", cookieOpts);
  res.cookies.set(ADMIN_COOKIE, "", cookieOpts);
  return res;
}
