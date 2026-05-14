import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { clientsTableHasCompanyIdColumn } from "@/lib/clients-company-column";
import { pool } from "@/lib/db";
import { requireCompanySession } from "@/lib/require-company-api";

type ProfileRow = RowDataPacket & {
  client_name: string | null;
  account_holder_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
};

/** Latest saved payout recipient details for this company + external client ID (for form autocomplete). */
export async function GET(req: Request) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get("client_id")?.trim() ?? "";
  if (!externalId) {
    return NextResponse.json({ ok: false, error: "client_id query parameter is required" }, { status: 400 });
  }

  const useClients = await clientsTableHasCompanyIdColumn(pool);
  if (useClients && externalId.length > 100) {
    return NextResponse.json({ ok: false, error: "client_id must be at most 100 characters" }, { status: 400 });
  }
  const [rows] = useClients
    ? await pool.execute<ProfileRow[]>(
        `SELECT \`client_name\`,
                \`bank_account_holder_name\` AS \`account_holder_name\`,
                \`bank_name\`,
                \`account_number\` AS \`bank_account_number\`,
                \`ifsc_code\`
         FROM \`clients\`
         WHERE \`company_id\` = ? AND \`client_id\` = ?
         LIMIT 1`,
        [auth.companyId, externalId],
      )
    : await pool.execute<ProfileRow[]>(
        `SELECT \`client_name\`, \`account_holder_name\`, \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`
         FROM \`company_payout_client_profiles\`
         WHERE \`company_id\` = ? AND \`external_client_id\` = ?
         ORDER BY \`id\` DESC
         LIMIT 1`,
        [auth.companyId, externalId],
      );
  const r = rows[0];
  if (!r) {
    return NextResponse.json({ ok: true as const, profile: null });
  }
  return NextResponse.json({
    ok: true as const,
    profile: {
      client_name: (r.client_name ?? "").trim(),
      account_holder_name: (r.account_holder_name ?? "").trim(),
      bank_name: (r.bank_name ?? "").trim(),
      bank_account_number: (r.bank_account_number ?? "").trim(),
      ifsc_code: (r.ifsc_code ?? "").trim(),
    },
  });
}
