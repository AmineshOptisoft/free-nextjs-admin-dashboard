import type { RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 AS ok");
    return NextResponse.json({ ok: true, database: process.env.MYSQL_DATABASE ?? "tepay", rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
