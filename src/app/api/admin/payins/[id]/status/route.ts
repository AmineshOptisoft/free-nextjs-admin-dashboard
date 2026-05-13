import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { canAdminVerifyPayIn } from "@/lib/payin-lifecycle";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  status: string;
};

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid payin id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const toStatus = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
  if (!toStatus) {
    return NextResponse.json({ ok: false, error: "status is required" }, { status: 400 });
  }

  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`status\` FROM \`transactions\` WHERE \`id\` = ? AND \`type\` = 'PAYIN' LIMIT 1`,
    [txId],
  );
  const tx = rows[0];
  if (!tx) return NextResponse.json({ ok: false, error: "PayIn not found" }, { status: 404 });

  if (!canAdminVerifyPayIn(tx.status, toStatus)) {
    return NextResponse.json(
      { ok: false, error: `Invalid status change from ${tx.status} to ${toStatus}` },
      { status: 409 },
    );
  }

  const [res] = await pool.execute<ResultSetHeader>(
    "UPDATE `transactions` SET `status` = ? WHERE `id` = ? AND `type` = 'PAYIN'",
    [toStatus, txId],
  );
  if (res.affectedRows === 0) {
    return NextResponse.json({ ok: false, error: "Could not update payin status" }, { status: 500 });
  }
  return NextResponse.json({ ok: true as const, status: toStatus });
}
