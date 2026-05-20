import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  createCompanyApiKey,
  isMissingCompanyApiKeysTable,
  listCompanyApiKeys,
} from "@/lib/company-api-keys";
import { requireAdminSession } from "@/lib/require-admin-api";

function parseCompanyId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const companyId = parseCompanyId(idRaw);
  if (!companyId) {
    return NextResponse.json({ ok: false, error: "Invalid company id" }, { status: 400 });
  }

  try {
    const keys = await listCompanyApiKeys(pool, companyId);
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

export async function POST(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const companyId = parseCompanyId(idRaw);
  if (!companyId) {
    return NextResponse.json({ ok: false, error: "Invalid company id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";

  try {
    const created = await createCompanyApiKey(pool, companyId, label);
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
