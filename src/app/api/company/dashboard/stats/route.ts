import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireCompanySession } from "@/lib/require-company-api";

export async function GET() {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<any[]>(`
      SELECT 
        SUM(CASE WHEN type = 'PAYIN' THEN amount ELSE 0 END) as totalPayIn,
        SUM(CASE WHEN type = 'PAYOUT' THEN amount ELSE 0 END) as totalPayOut,
        SUM(CASE WHEN type = 'PAYIN' AND status IN ('APPROVED', 'APPROVED_BY_ADMIN', 'APPROVED_BY_AGENT', 'EXPIRED_APPROVED_BY_ADMIN', 'EXPIRED_APPROVED_BY_AGENT') THEN 1 ELSE 0 END) as successPayInCount,
        SUM(CASE WHEN type = 'PAYOUT' AND status IN ('APPROVED', 'APPROVED_BY_ADMIN', 'APPROVED_BY_AGENT', 'EXPIRED_APPROVED_BY_ADMIN', 'EXPIRED_APPROVED_BY_AGENT') THEN 1 ELSE 0 END) as successPayOutCount,
        SUM(CASE WHEN type = 'PAYIN' THEN 1 ELSE 0 END) as totalPayInCount,
        SUM(CASE WHEN type = 'PAYOUT' THEN 1 ELSE 0 END) as totalPayOutCount
      FROM transactions
      WHERE company_id = ?
    `, [auth.companyId]);

    const row = rows[0] || {};
    return NextResponse.json({
      ok: true,
      stats: {
        totalPayInAmount: Number(row.totalPayIn) || 0,
        totalPayOutAmount: Number(row.totalPayOut) || 0,
        successPayInCount: Number(row.successPayInCount) || 0,
        successPayOutCount: Number(row.successPayOutCount) || 0,
        totalPayInCount: Number(row.totalPayInCount) || 0,
        totalPayOutCount: Number(row.totalPayOutCount) || 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
  }
}
