import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string;
  logo: string | null;
  status: string;
  company_code: string | null;
  commission: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  settlement_amount: string | number;
  today_pay_in: string | number;
  today_pay_out: string | number;
};

type ColumnRow = RowDataPacket & { Field: string };

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

async function hasCommissionColumn(): Promise<boolean> {
  const [rows] = await pool.execute<ColumnRow[]>("SHOW COLUMNS FROM `companies` LIKE 'commission'");
  return rows.length > 0;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search")?.trim() ?? "";

  const includeCommission = await hasCommissionColumn();
  let sql = `
    SELECT c.\`id\`, c.\`username\`, c.\`brand_name\`, c.\`logo\`, c.\`status\`, c.\`company_code\`,
           ${includeCommission ? "c.`commission`," : ""}
           c.\`net_pay_in\`, c.\`net_pay_out\`, c.\`settlement_amount\`,
           COALESCE(tx.today_pay_in, 0) AS today_pay_in,
           COALESCE(tx.today_pay_out, 0) AS today_pay_out
    FROM \`companies\` c
    LEFT JOIN (
      SELECT
        t.\`company_id\`,
        SUM(CASE WHEN t.\`type\` = 'PAYIN' AND DATE(t.\`created_at\`) = CURRENT_DATE() THEN t.\`amount\` ELSE 0 END) AS today_pay_in,
        SUM(CASE WHEN t.\`type\` = 'PAYOUT' AND DATE(t.\`created_at\`) = CURRENT_DATE() THEN t.\`amount\` ELSE 0 END) AS today_pay_out
      FROM \`transactions\` t
      GROUP BY t.\`company_id\`
    ) tx ON tx.\`company_id\` = c.\`id\`
  `;
  const params: string[] = [];
  if (q) {
    sql += ` WHERE (c.\`username\` LIKE CONCAT('%', ?, '%') OR c.\`brand_name\` LIKE CONCAT('%', ?, '%') OR c.\`company_code\` LIKE CONCAT('%', ?, '%')) `;
    params.push(q, q, q);
  }
  sql += ` ORDER BY c.\`id\` DESC LIMIT 500`;

  const [rows] = await pool.execute<CompanyRow[]>(sql, params);

  const companies = rows.map((r) => ({
    id: String(r.id),
    username: r.username,
    brand_name: r.brand_name ?? "",
    logo: r.logo,
    status: r.status,
    company_code: r.company_code,
    commission: num(includeCommission ? r.commission : 0),
    net_pay_in: num(r.net_pay_in),
    net_pay_out: num(r.net_pay_out),
    settlement_amount: num(r.settlement_amount),
    today_pay_in: num(r.today_pay_in),
    today_pay_out: num(r.today_pay_out),
  }));

  return NextResponse.json({ ok: true as const, companies });
}
