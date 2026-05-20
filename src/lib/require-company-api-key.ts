import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { findCompanyByApiKey } from "@/lib/company-api-keys";
import { pool } from "@/lib/db";
import { companyPaymentsBlockMessage, isCompanyAcceptingPayments } from "@/lib/party-status";

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string | null;
  logo: string | null;
  status: string;
  company_code: string | null;
};

function readApiKey(req: Request): string {
  return (
    req.headers.get("x-api-key")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    ""
  );
}

async function loadCompany(companyId: number): Promise<CompanyRow | null> {
  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`
     FROM \`companies\` WHERE \`id\` = ? LIMIT 1`,
    [companyId],
  );
  return rows[0] ?? null;
}

export async function requireCompanyApiKey(
  req: Request,
): Promise<
  | { ok: true; companyId: number; keyId: number; company: CompanyRow }
  | { ok: false; response: NextResponse }
> {
  const rawKey = readApiKey(req);
  if (!rawKey) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Missing x-api-key header" }, { status: 401 }),
    };
  }

  let match: { companyId: number; keyId: number } | null;
  try {
    match = await findCompanyByApiKey(pool, rawKey);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Invalid API key" }, { status: 401 }),
    };
  }

  if (!match) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Invalid API key" }, { status: 401 }),
    };
  }

  const company = await loadCompany(match.companyId);
  if (!company) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 }),
    };
  }

  if (!isCompanyAcceptingPayments(company.status)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: companyPaymentsBlockMessage(company.status) },
        { status: 403 },
      ),
    };
  }

  return { ok: true, companyId: match.companyId, keyId: match.keyId, company };
}
