import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createCompanyApiKey,
  isMissingCompanyApiKeysTable,
  listCompanyApiKeys,
} from "@/lib/company-api-keys";
import { requireCompanySession } from "@/lib/require-company-api";

export async function GET() {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  try {
    const keys = await listCompanyApiKeys(pool, auth.companyId);
    return NextResponse.json({ ok: true as const, keys });
  } catch (e) {
    if (isMissingCompanyApiKeysTable(e)) {
      return NextResponse.json(
        {
          ok: false,
          error: "API keys table missing. Run database/migrations/009_company_api_keys.sql on your DB.",
        },
        { status: 500 },
      );
    }
    throw e;
  }
}

export async function POST(req: Request) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";

  try {
    const created = await createCompanyApiKey(pool, auth.companyId, label);
    return NextResponse.json({
      ok: true as const,
      key: created.key,
      fullKey: created.fullKey,
    });
  } catch (e) {
    if (isMissingCompanyApiKeysTable(e)) {
      return NextResponse.json(
        {
          ok: false,
          error: "API keys table missing. Run database/migrations/009_company_api_keys.sql on your DB.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: false, error: "Could not create API key" }, { status: 500 });
  }
}
