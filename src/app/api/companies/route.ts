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
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search")?.trim() ?? "";

  let sql = `
    SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`, \`commission\`,
           \`net_pay_in\`, \`net_pay_out\`, \`settlement_amount\`
    FROM \`companies\`
  `;
  const params: string[] = [];
  if (q) {
    sql += ` WHERE (\`username\` LIKE CONCAT('%', ?, '%') OR \`brand_name\` LIKE CONCAT('%', ?, '%') OR \`company_code\` LIKE CONCAT('%', ?, '%')) `;
    params.push(q, q, q);
  }
  sql += ` ORDER BY \`id\` DESC LIMIT 500`;

  const [rows] = await pool.execute<CompanyRow[]>(sql, params);

  const companies = rows.map((r) => ({
    id: String(r.id),
    username: r.username,
    brand_name: r.brand_name ?? "",
    logo: r.logo,
    status: r.status,
    company_code: r.company_code,
    commission: num(r.commission),
    net_pay_in: num(r.net_pay_in),
    net_pay_out: num(r.net_pay_out),
    settlement_amount: num(r.settlement_amount),
  }));

  return NextResponse.json({ ok: true as const, companies });
}
