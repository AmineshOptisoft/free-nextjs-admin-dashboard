import { NextResponse } from "next/server";
import { ADMIN_COOKIE, AGENT_COOKIE, COMPANY_COOKIE } from "@/lib/session";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function POST(req: Request) {
  let role: string = "admin";
  try {
    const body = await req.json();
    if (typeof body?.role === "string") role = body.role;
  } catch {
    /* empty body → admin */
  }

  const res = NextResponse.json({ ok: true as const });

  if (role === "agent") {
    res.cookies.set(AGENT_COOKIE, "", cookieOpts);
  } else if (role === "company") {
    res.cookies.set(COMPANY_COOKIE, "", cookieOpts);
  } else {
    res.cookies.set(ADMIN_COOKIE, "", cookieOpts);
  }

  return res;
}
