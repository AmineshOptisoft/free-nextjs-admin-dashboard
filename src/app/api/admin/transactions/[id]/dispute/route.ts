import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  dispute_raised: number;
};

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid transaction id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  const [rows] = await pool.execute<TxRow[]>(
    "SELECT `id`, `dispute_raised` FROM `transactions` WHERE `id` = ? LIMIT 1",
    [txId],
  );
  if (!rows[0]) {
    return NextResponse.json({ ok: false, error: "Transaction not found" }, { status: 404 });
  }

  const [res] = await pool.execute<ResultSetHeader>(
    "UPDATE `transactions` SET `dispute_raised` = 1, `dispute_reason` = ? WHERE `id` = ?",
    [reason || "Other", txId],
  );
  if (res.affectedRows === 0) {
    return NextResponse.json({ ok: false, error: "Could not raise dispute" }, { status: 500 });
  }
  return NextResponse.json({ ok: true as const });
}
