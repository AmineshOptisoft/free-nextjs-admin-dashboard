import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { canAgentVerifyPayIn } from "@/lib/payin-lifecycle";
import { requireAgentSession } from "@/lib/require-agent-api";

type TxRow = RowDataPacket & {
  id: number;
  status: string;
};

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAgentSession();
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
  const utrCode = typeof body.utr_code === "string" ? body.utr_code.trim() : "";
  if (!toStatus) {
    return NextResponse.json({ ok: false, error: "status is required" }, { status: 400 });
  }

  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`status\`
     FROM \`transactions\`
     WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND \`assigned_agent_id\` = ?
     LIMIT 1`,
    [txId, auth.agentId],
  );
  const tx = rows[0];
  if (!tx) return NextResponse.json({ ok: false, error: "PayIn not found for this agent" }, { status: 404 });
  const fromStatus = String(tx.status ?? "").trim().toUpperCase();

  if (!canAgentVerifyPayIn(fromStatus, toStatus)) {
    return NextResponse.json(
      { ok: false, error: `Invalid status change from ${fromStatus || "UNKNOWN"} to ${toStatus}` },
      { status: 409 },
    );
  }

  const [res] = await pool.execute<ResultSetHeader>(
    "UPDATE `transactions` SET `status` = ?, `utr_code` = COALESCE(NULLIF(?, ''), `utr_code`) WHERE `id` = ? AND `assigned_agent_id` = ? AND `type` = 'PAYIN'",
    [toStatus, utrCode, txId, auth.agentId],
  );
  if (res.affectedRows === 0) {
    return NextResponse.json({ ok: false, error: "Could not update payin status" }, { status: 500 });
  }
  return NextResponse.json({ ok: true as const, status: toStatus });
}
