import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-password";
import { AGENT_COOKIE, signAgentSession } from "@/lib/session";

type Row = RowDataPacket & { id: number; password: string };

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
  const username = jsonStringOrNumberField(b.username);
  const password = jsonStringOrNumberField(b.password);

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Username and password required" }, { status: 400 });
  }

  const [rows] = await pool.execute<Row[]>(
    "SELECT `id`, `password` FROM `agents` WHERE `username` = ? AND `status` = 'active' LIMIT 1",
    [username],
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, row.password);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAgentSession({ agentId: row.id, username }, secret);
  const res = NextResponse.json({
    ok: true as const,
    user: { agentId: row.id, username },
  });

  res.cookies.set(AGENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
