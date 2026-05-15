import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { getSocketServer } from "@/lib/realtime/socket-server";
import { TRANSACTION_UPDATE_EVENT, type TransactionRealtimeAction, type TransactionRealtimePayload } from "@/lib/realtime/types";

type TxRow = RowDataPacket & {
  id: number;
  type: string;
  status: string;
  dispute_raised: number;
  dispute_state: string | null;
  assigned_agent_id: number | null;
  company_id: number | null;
  resolved_agent_id?: number | null;
};

function resolveAgentId(tx: TxRow): number | null {
  const direct = tx.assigned_agent_id != null ? Number(tx.assigned_agent_id) : null;
  if (direct != null && direct > 0) return direct;
  const viaPm = tx.resolved_agent_id != null ? Number(tx.resolved_agent_id) : null;
  return viaPm != null && viaPm > 0 ? viaPm : null;
}

export async function broadcastTransactionById(txId: number, action: TransactionRealtimeAction): Promise<void> {
  const io = getSocketServer();
  if (!io) return;

  let rows: TxRow[];
  try {
    const [r] = await pool.execute<TxRow[]>(
      `SELECT t.\`id\`, t.\`type\`, t.\`status\`, t.\`dispute_raised\`, t.\`dispute_state\`,
              t.\`assigned_agent_id\`, t.\`company_id\`,
              COALESCE(NULLIF(t.\`assigned_agent_id\`, 0), pm.\`agent_id\`) AS resolved_agent_id
       FROM \`transactions\` t
       LEFT JOIN \`pay_methods\` pm ON pm.\`id\` = t.\`pay_method_id\`
       WHERE t.\`id\` = ? LIMIT 1`,
      [txId],
    );
    rows = r;
  } catch {
    const [r] = await pool.execute<TxRow[]>(
      `SELECT \`id\`, \`type\`, \`status\`, \`dispute_raised\`, \`assigned_agent_id\`, \`company_id\`
       FROM \`transactions\` WHERE \`id\` = ? LIMIT 1`,
      [txId],
    );
    rows = r.map((row) => ({ ...row, dispute_state: null }));
  }

  const tx = rows[0];
  if (!tx) return;

  const payload: TransactionRealtimePayload = {
    id: String(tx.id),
    type: String(tx.type).toUpperCase() === "PAYOUT" ? "PAYOUT" : "PAYIN",
    status: String(tx.status ?? "").toUpperCase(),
    disputeRaised: Number(tx.dispute_raised ?? 0) === 1,
    disputeState: String(tx.dispute_state ?? "NONE").toUpperCase(),
    assignedAgentId: resolveAgentId(tx),
    companyId: tx.company_id != null ? Number(tx.company_id) : null,
    action,
    updatedAt: new Date().toISOString(),
  };

  io.to("role:admin").emit(TRANSACTION_UPDATE_EVENT, payload);

  if (payload.companyId != null) {
    io.to(`role:company:${payload.companyId}`).emit(TRANSACTION_UPDATE_EVENT, payload);
  }

  if (payload.assignedAgentId != null) {
    io.to(`role:agent:${payload.assignedAgentId}`).emit(TRANSACTION_UPDATE_EVENT, payload);
  }
}

/** Fire-and-forget — never block API responses on socket delivery. */
export function emitTransactionRealtime(txId: number, action: TransactionRealtimeAction): void {
  void broadcastTransactionById(txId, action).catch((e) => {
    console.error("[realtime] broadcast failed", e);
  });
}
