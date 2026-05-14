import { NextResponse } from "next/server";
import { rowToPayInItem, rowToPayOutItem, type TxRow } from "@/lib/agent-transactions-map";
import { pool } from "@/lib/db";
import { requireAgentSession } from "@/lib/require-agent-api";
import { getPayoutAgentApproveDelayMinutesFromEnv } from "@/lib/payout-agent-approve-delay";
import { expireOpenRequestsPastDeadline } from "@/lib/request-expiry";

const SELECT_PAYIN = `
  \`id\`, \`random_code\`, \`order_id\`, \`amount\`, \`status\`, \`type\`,
  \`client_name\`, \`client_upi\`, \`assigned_upi\`, \`user_upi\`,
  \`utr_code\`, \`payment_image\`, \`user_note\`,
  \`created_at\`, \`assigned_date\`, \`assigned_agent_id\`,
  \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`dispute_raised\`, \`expires_at\`
`;

export async function GET(req: Request) {
  const auth = await requireAgentSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const typeRaw = searchParams.get("type")?.toUpperCase() ?? "";
  if (typeRaw !== "PAYIN" && typeRaw !== "PAYOUT") {
    return NextResponse.json({ ok: false, error: "Query type=PAYIN or type=PAYOUT required" }, { status: 400 });
  }

  const limitRaw = Number(searchParams.get("limit") ?? "500");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 500) : 500;

  const sql = `
    SELECT ${SELECT_PAYIN}
    FROM \`transactions\`
    WHERE \`assigned_agent_id\` = ? AND \`type\` = ?
    ORDER BY \`id\` DESC
    LIMIT ${limit}
  `;

  try {
    await expireOpenRequestsPastDeadline(pool);
    const [rows] = await pool.execute<TxRow[]>(sql, [auth.agentId, typeRaw]);
    const items =
      typeRaw === "PAYIN"
        ? rows.map((r) => rowToPayInItem(r))
        : rows.map((r) => rowToPayOutItem(r, "agent"));
    if (typeRaw === "PAYOUT") {
      return NextResponse.json({
        ok: true as const,
        items,
        payoutAgentApproveDelayMinutes: getPayoutAgentApproveDelayMinutesFromEnv(),
      });
    }
    return NextResponse.json({ ok: true as const, items });
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "ER_BAD_FIELD_ERROR") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Database columns mismatch. Run database/migrations/002_rename_transactions_columns.sql if needed.",
        },
        { status: 503 },
      );
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not load transactions" }, { status: 500 });
  }
}
