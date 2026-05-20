import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isMissingCompanyApiKeysTable, revokeCompanyApiKey } from "@/lib/company-api-keys";
import { requireCompanySession } from "@/lib/require-company-api";

export async function PATCH(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const keyId = Number(idRaw);
  if (!Number.isInteger(keyId) || keyId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid key id" }, { status: 400 });
  }

  try {
    const revoked = await revokeCompanyApiKey(pool, auth.companyId, keyId);
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
