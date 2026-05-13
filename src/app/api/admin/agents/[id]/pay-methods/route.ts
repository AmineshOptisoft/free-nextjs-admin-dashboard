import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import {
  PAY_METHOD_SELECT,
  payMethodToStaffApi,
  type PayMethodRow,
} from "@/lib/agent-payment-method-map";
import { pool } from "@/lib/db";
import { isMysqlErNoSuchTable, PAY_METHODS_TABLE_HINT } from "@/lib/mysql-table-error";
import { requireAdminSession } from "@/lib/require-admin-api";
import { loadPayMethodFinancials } from "@/lib/transactions-pay-method-financials";

type AgentRow = RowDataPacket & { id: number; username: string | null };

export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const agentId = Number(idRaw);
  if (!Number.isInteger(agentId) || agentId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid agent id" }, { status: 400 });
  }

  const [agentRows] = await pool.execute<AgentRow[]>(
    "SELECT `id`, `username` FROM `agents` WHERE `id` = ? LIMIT 1",
    [agentId],
  );
  const agentRow = agentRows[0];
  if (!agentRow) {
    return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });
  }

  const agentUsername = (agentRow.username ?? "").trim() || `Agent #${agentId}`;

  try {
    const [rows] = await pool.execute<PayMethodRow[]>(
      `SELECT ${PAY_METHOD_SELECT}
       FROM \`pay_methods\` WHERE \`agent_id\` = ? ORDER BY \`id\` DESC`,
      [agentId],
    );

    const ids = rows.map((r) => r.id);
    const financialByPm = await loadPayMethodFinancials(agentId, ids);
    const payment_methods = rows.map((r) => payMethodToStaffApi(r, agentUsername, financialByPm.get(r.id)));

    return NextResponse.json({ ok: true as const, payment_methods });
  } catch (e: unknown) {
    if (isMysqlErNoSuchTable(e)) {
      return NextResponse.json({ ok: false, error: PAY_METHODS_TABLE_HINT }, { status: 503 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not load payment methods" }, { status: 500 });
  }
}
