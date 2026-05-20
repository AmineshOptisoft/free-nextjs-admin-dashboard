import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";
import type { ResultSetHeader } from "mysql2/promise";

export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { subadminId, amount, remarks, txType, date } = body;

  if (!subadminId || !amount) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const amountVal = Number(amount);
  if (!Number.isFinite(amountVal) || amountVal <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
  }

  // If txType is debit, we deduct. If credit, we add. 
  // Depending on accounting, usually Credit = add to balance, Debit = deduct from balance.
  const diff = txType === "debit" ? -amountVal : amountVal;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE \`agents\` SET \`security_deposit\` = \`security_deposit\` + ? WHERE \`id\` = ?`,
      [diff, subadminId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
