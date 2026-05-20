import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { merchantError, merchantSuccess, txToMerchantPayinStatusData } from "@/lib/merchant-payin-map";
import { expireOpenRequestsPastDeadline } from "@/lib/request-expiry";
import { requireCompanyApiKey } from "@/lib/require-company-api-key";

type TxRow = RowDataPacket & {
  id: number;
  company_id: number | null;
  order_id: string;
  amount: string | number;
  status: string;
  assigned_upi: string | null;
  utr_code: string | null;
  payment_image: string | null;
  user_note: string | null;
};

async function loadTx(txId: number): Promise<TxRow | null> {
  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`company_id\`, \`order_id\`, \`amount\`, \`status\`, \`assigned_upi\`, \`utr_code\`, \`payment_image\`, \`user_note\`
     FROM \`transactions\`
     WHERE \`id\` = ? AND \`type\` = 'PAYIN'
     LIMIT 1`,
    [txId],
  );
  return rows[0] ?? null;
}

export async function GET(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireCompanyApiKey(req);
  if (!auth.ok) {
    const err = await auth.response.json().catch(() => ({}));
    const message =
      typeof (err as { error?: unknown }).error === "string"
        ? String((err as { error: string }).error)
        : "Unauthorized (Invalid API Key)";
    return NextResponse.json({ success: false, message }, { status: 401 });
  }

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    const e = merchantError("Invalid pay-in id", 400);
    return NextResponse.json(e.body, { status: e.status });
  }

  await expireOpenRequestsPastDeadline(pool);
  const tx = await loadTx(txId);
  if (!tx || Number(tx.company_id) !== auth.companyId) {
    const e = merchantError("Pay-in not found", 404);
    return NextResponse.json(e.body, { status: e.status });
  }

  return NextResponse.json(
    merchantSuccess("Pay-in status fetched successfully.", txToMerchantPayinStatusData(tx)),
  );
}
