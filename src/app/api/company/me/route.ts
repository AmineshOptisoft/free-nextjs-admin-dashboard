import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireCompanySession } from "@/lib/require-company-api";

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string | null;
  logo: string | null;
  status: string;
  company_code: string | null;
};

export async function GET() {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`
     FROM \`companies\`
     WHERE \`id\` = ? LIMIT 1`,
    [auth.companyId],
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 });
  return NextResponse.json({
    ok: true as const,
    company: {
      id: String(row.id),
      username: row.username,
      brand_name: row.brand_name ?? "",
      logo: row.logo,
      status: row.status,
      company_code: row.company_code,
    },
  });
}
