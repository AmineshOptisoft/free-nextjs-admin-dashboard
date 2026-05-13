import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type DisputeRow = RowDataPacket & {
  id: number;
  order_id: string;
  amount: string | number;
  type: string;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  utr_code: string | null;
  assigned_upi: string | null;
  dispute_raised: number;
  dispute_reason: string | null;
  created_at: Date | string | null;
  company_name: string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function toPaymentStatus(type: string, status: string): string {
  const s = String(status ?? "").toUpperCase();
  const isApproved = s.includes("APPROVED");
  if (String(type).toUpperCase() === "PAYIN") return isApproved ? "PAYIN_APPROVED" : "PAYIN_PENDING";
  return isApproved ? "PAYOUT_APPROVED" : "PAYOUT_PENDING";
}

function toDisputeStatus(disputeRaised: number, txStatus: string): string {
  if (disputeRaised === 1) return "PENDING";
  const s = String(txStatus ?? "").toUpperCase();
  if (s.includes("EXPIRED") || s === "REVOKED") return "EXPIRED";
  return "RESOLVED";
}

function formatDt(v: Date | string | null): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "500");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 500) : 500;

  const [rows] = await pool.execute<DisputeRow[]>(
    `SELECT
       t.\`id\`, t.\`order_id\`, t.\`amount\`, t.\`type\`, t.\`status\`,
       t.\`client_name\`, t.\`client_upi\`, t.\`utr_code\`, t.\`assigned_upi\`,
       t.\`dispute_raised\`, t.\`dispute_reason\`, t.\`created_at\`,
       c.\`brand_name\` AS company_name
     FROM \`transactions\` t
     LEFT JOIN \`companies\` c ON c.\`id\` = t.\`company_id\`
     WHERE (t.\`dispute_raised\` = 1 OR (t.\`dispute_reason\` IS NOT NULL AND t.\`dispute_reason\` <> ''))
     ORDER BY t.\`id\` DESC
     LIMIT ${limit}`,
  );

  const items = rows
    .map((r) => ({
      id: String(r.id),
      ref: `#${String(r.order_id).slice(0, 11)}`,
      amount: num(r.amount),
      disputeStatus: toDisputeStatus(Number(r.dispute_raised ?? 0), r.status),
      paymentStatus: toPaymentStatus(r.type, r.status),
      orderId: r.order_id,
      companyName: (r.company_name ?? "").trim() || "—",
      subAdminName: "—",
      clientName: (r.client_name ?? "").trim() || "—",
      clientUpi: (r.client_upi ?? "").trim() || "—",
      utrCode: (r.utr_code ?? "").trim() || "—",
      assignedUpi: (r.assigned_upi ?? "").trim() || "—",
      reason: (r.dispute_reason ?? "").trim() || "Other",
      createdOn: formatDt(r.created_at),
    }))
    .filter((r) => !status || r.disputeStatus === status);

  return NextResponse.json({ ok: true as const, items });
}
