import { NextResponse } from "next/server";
import { rowToPayInItem, rowToPayOutItem, type TxRow } from "@/lib/agent-transactions-map";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

const SELECT_TX = `
  \`id\`, \`random_code\`, \`order_id\`, \`amount\`, \`status\`, \`type\`,
  \`client_name\`, \`client_upi\`, \`assigned_upi\`, \`user_upi\`,
  \`utr_code\`, \`payment_image\`, \`user_note\`,
  \`created_at\`, \`assigned_date\`,
  \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`
`;

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const typeRaw = searchParams.get("type")?.toUpperCase() ?? "";
  if (typeRaw !== "PAYIN" && typeRaw !== "PAYOUT") {
    return NextResponse.json({ ok: false, error: "Query type=PAYIN or type=PAYOUT required" }, { status: 400 });
  }

  const statusRaw = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "500");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 500) : 500;

  const where = ["`type` = ?"];
  const params: Array<string> = [typeRaw];
  if (statusRaw) {
    where.push("`status` = ?");
    params.push(statusRaw);
  }

  const sql = `
    SELECT ${SELECT_TX}
    FROM \`transactions\`
    WHERE ${where.join(" AND ")}
    ORDER BY \`id\` DESC
    LIMIT ${limit}
  `;

  try {
    const [rows] = await pool.execute<TxRow[]>(sql, params);
    const items = typeRaw === "PAYIN" ? rows.map((r) => rowToPayInItem(r)) : rows.map((r) => rowToPayOutItem(r));
    return NextResponse.json({ ok: true as const, items });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "ER_BAD_FIELD_ERROR") {
      return NextResponse.json(
        {
          ok: false,
          error: "Database columns mismatch. Run database/migrations/002_rename_transactions_columns.sql if needed.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: "Could not load transactions" }, { status: 500 });
  }
}
