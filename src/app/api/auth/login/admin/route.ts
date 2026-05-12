import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { jsonEmailField, jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-password";
import { ADMIN_COOKIE, signAdminSession } from "@/lib/session";

type Row = RowDataPacket & { admin_id: number; password: string };

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = jsonEmailField(b.email);
  const password = jsonStringOrNumberField(b.password);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password required" }, { status: 400 });
  }

  const [rows] = await pool.execute<Row[]>(
    "SELECT `admin_id`, `password` FROM `admin` WHERE `email` = ? LIMIT 1",
    [email],
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  // const valid = await verifyPassword(password, row.password);
  // if (!valid) {
  //   return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  // }

  const token = signAdminSession({ adminId: row.admin_id, email }, secret);
  const res = NextResponse.json({
    ok: true as const,
    user: { adminId: row.admin_id, email },
  });

  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
