import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  amount: string | number;
  status: string;
  type: string;
  assigned_agent_id: number | null;
  assigned_agent_name: string | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const limitRaw = Number(searchParams.get("limit") ?? "2000");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(100, limitRaw), 5000) : 2000;

  const [rows] = await pool.execute<TxRow[]>(
    `SELECT
       t.\`id\`,
       t.\`amount\`,
       t.\`status\`,
       t.\`type\`,
       t.\`assigned_agent_id\`,
       COALESCE(NULLIF(TRIM(a.\`fullname\`), ''), a.\`username\`) AS assigned_agent_name
     FROM \`transactions\` t
     LEFT JOIN \`agents\` a ON a.\`id\` = t.\`assigned_agent_id\`
     WHERE t.\`type\` IN ('PAYIN', 'PAYOUT')
     ORDER BY t.\`id\` DESC
     LIMIT ${limit}`,
  );

  const payins: Array<{
    id: string;
    amount: number;
    status: string;
    assignedAgentName: string;
    assignedAgentId: string | null;
  }> = [];
  const payouts: Array<{
    id: string;
    amount: number;
    status: string;
    assignedAgentName: string;
    assignedAgentId: string | null;
  }> = [];

  for (const r of rows) {
    const aid = r.assigned_agent_id != null ? String(r.assigned_agent_id) : null;
    const item = {
      id: String(r.id),
      amount: num(r.amount),
      status: String(r.status || "").toUpperCase(),
      assignedAgentName: (r.assigned_agent_name ?? "").trim() || "Unassigned",
      assignedAgentId: aid,
    };
    if (String(r.type).toUpperCase() === "PAYIN") payins.push(item);
    else payouts.push(item);
  }

  return NextResponse.json({ ok: true as const, payins, payouts });
}
