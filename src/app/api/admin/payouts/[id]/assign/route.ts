import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { canAdminAssign } from "@/lib/payout-lifecycle";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  status: string;
};

type AgentRow = RowDataPacket & {
  id: number;
};

type PayMethodRow = RowDataPacket & {
  id: number;
};

export async function POST(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid payout id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const agentId = Number(body.agentId);
  const payMethodId = body.payMethodId == null ? null : Number(body.payMethodId);
  if (!Number.isInteger(agentId) || agentId < 1) {
    return NextResponse.json({ ok: false, error: "Valid agentId required" }, { status: 400 });
  }
  if (payMethodId != null && (!Number.isInteger(payMethodId) || payMethodId < 1)) {
    return NextResponse.json({ ok: false, error: "payMethodId must be a positive number" }, { status: 400 });
  }

  const [txRows] = await pool.execute<TxRow[]>(
    "SELECT `id`, `status` FROM `transactions` WHERE `id` = ? AND `type` = 'PAYOUT' LIMIT 1",
    [txId],
  );
  const tx = txRows[0];
  if (!tx) return NextResponse.json({ ok: false, error: "Payout not found" }, { status: 404 });
  if (!canAdminAssign(tx.status)) {
    return NextResponse.json({ ok: false, error: `Cannot assign payout while status is ${tx.status}` }, { status: 409 });
  }

  const [agents] = await pool.execute<AgentRow[]>(
    "SELECT `id` FROM `agents` WHERE `id` = ? LIMIT 1",
    [agentId],
  );
  if (!agents[0]) return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });

  if (payMethodId != null) {
    const [payMethods] = await pool.execute<PayMethodRow[]>(
      "SELECT `id` FROM `pay_methods` WHERE `id` = ? AND `agent_id` = ? LIMIT 1",
      [payMethodId, agentId],
    );
    if (!payMethods[0]) {
      return NextResponse.json({ ok: false, error: "payMethodId does not belong to selected agent" }, { status: 400 });
    }
  }

  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE \`transactions\`
     SET \`assigned_agent_id\` = ?, \`pay_method_id\` = ?, \`status\` = 'PENDING', \`assigned_date\` = NOW()
     WHERE \`id\` = ? AND \`type\` = 'PAYOUT'`,
    [agentId, payMethodId, txId],
  );

  if (res.affectedRows === 0) return NextResponse.json({ ok: false, error: "Could not assign payout" }, { status: 500 });
  return NextResponse.json({ ok: true as const });
}
