import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { companyPaymentsBlockMessage, isCompanyAcceptingPayments } from "@/lib/party-status";
import { createPublicPayIn } from "@/lib/public-payin-create";

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string | null;
  logo: string | null;
  status: string;
  company_code: string | null;
};

function decodeCompanyKey(raw: string): string {
  const input = String(raw || "").trim();
  if (!input) return "";
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf8").trim();
    return decoded || input;
  } catch {
    return input;
  }
}

async function loadCompanyByKey(companyKey: string): Promise<CompanyRow | null> {
  const decoded = decodeCompanyKey(companyKey);
  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`
     FROM \`companies\`
     WHERE \`company_code\` = ? OR \`username\` = ?
     LIMIT 1`,
    [decoded, decoded],
  );
  return rows[0] ?? null;
}

function mapPublicCompany(company: CompanyRow) {
  const paymentsEnabled = isCompanyAcceptingPayments(company.status);
  return {
    id: String(company.id),
    brand_name: company.brand_name ?? company.username,
    logo: company.logo,
    company_code: company.company_code,
    status: String(company.status ?? "").trim(),
    paymentsEnabled,
    blockMessage: paymentsEnabled ? null : companyPaymentsBlockMessage(company.status),
  };
}

export async function GET(_req: Request, context: { params: { companyKey: string } | Promise<{ companyKey: string }> }) {
  const { companyKey } = await Promise.resolve(context.params);
  const company = await loadCompanyByKey(companyKey);
  if (!company) {
    return NextResponse.json({ ok: false, error: "Invalid payment link" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true as const,
    company: mapPublicCompany(company),
  });
}

export async function POST(req: Request, context: { params: { companyKey: string } | Promise<{ companyKey: string }> }) {
  const { companyKey } = await Promise.resolve(context.params);
  const company = await loadCompanyByKey(companyKey);
  if (!company) {
    return NextResponse.json({ ok: false, error: "Invalid payment link" }, { status: 404 });
  }
  if (!isCompanyAcceptingPayments(company.status)) {
    return NextResponse.json(
      { ok: false, error: companyPaymentsBlockMessage(company.status) },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const result = await createPublicPayIn(company, body);
  return NextResponse.json(result.body, { status: result.status });
}
