import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isMissingCompanyApiKeysTable, revokeCompanyApiKey } from "@/lib/company-api-keys";
import { requireAdminSession } from "@/lib/require-admin-api";

function parseId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function PATCH(
  _req: Request,
  context: { params: { id: string; keyId: string } | Promise<{ id: string; keyId: string }> },
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const params = await Promise.resolve(context.params);
  const companyId = parseId(params.id);
  const keyId = parseId(params.keyId);
  if (!companyId || !keyId) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  try {
    const revoked = await revokeCompanyApiKey(pool, companyId, keyId);
    if (!revoked) {
      return NextResponse.json({ ok: false, error: "Key not found or already revoked" }, { status: 404 });
    }
    return NextResponse.json({ ok: true as const });
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
