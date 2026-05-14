import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { isMysqlPacketTooLarge, validatePaymentProofPayload } from "@/lib/payment-proof-limits";
import { requireCompanySession } from "@/lib/require-company-api";

type TxRow = RowDataPacket & {
  id: number;
  status: string;
  assigned_agent_id: number | null;
  pay_method_id: number | null;
};

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid payin id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const utrCode = typeof body.utr_code === "string" ? body.utr_code.trim() : "";
  const paymentImage = typeof body.payment_image === "string" ? body.payment_image.trim() : "";
  const userUpi = typeof body.user_upi === "string" ? body.user_upi.trim() : "";
  if (!utrCode && !paymentImage) {
    return NextResponse.json({ ok: false, error: "Provide utr_code or payment_image" }, { status: 400 });
  }

  const proofCheck = validatePaymentProofPayload({
    utr_code: utrCode,
    payment_image: paymentImage,
    user_upi: userUpi,
  });
  if (!proofCheck.ok) {
    return NextResponse.json({ ok: false, error: proofCheck.error }, { status: proofCheck.status });
  }

  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`status\`, \`assigned_agent_id\`, \`pay_method_id\`
     FROM \`transactions\`
     WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND \`company_id\` = ?
     LIMIT 1`,
    [txId, auth.companyId],
  );
  const tx = rows[0];
  if (!tx) return NextResponse.json({ ok: false, error: "PayIn not found" }, { status: 404 });
  if (String(tx.status).toUpperCase() !== "PENDING" || !tx.assigned_agent_id || !tx.pay_method_id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          String(tx.status).toUpperCase() !== "PENDING"
            ? `UTR/proof only allowed while status is PENDING (current: ${tx.status})`
            : "Agent wait: account not assigned yet. Please retry after assignment.",
      },
      { status: 409 },
    );
  }

  let res: ResultSetHeader;
  try {
    const [r] = await pool.execute<ResultSetHeader>(
      `UPDATE \`transactions\`
       SET \`utr_code\` = COALESCE(NULLIF(?, ''), \`utr_code\`),
           \`payment_image\` = COALESCE(NULLIF(?, ''), \`payment_image\`),
           \`user_upi\` = COALESCE(NULLIF(?, ''), \`user_upi\`)
       WHERE \`id\` = ? AND \`company_id\` = ? AND \`type\` = 'PAYIN' AND \`status\` = 'PENDING'
         AND \`pay_method_id\` IS NOT NULL AND \`assigned_agent_id\` IS NOT NULL`,
      [utrCode, paymentImage, userUpi, txId, auth.companyId],
    );
    res = r;
  } catch (e: unknown) {
    if (isMysqlPacketTooLarge(e)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Proof data is too large for the database server. Use a smaller screenshot (under ~500 KB) or enter UTR only.",
        },
        { status: 413 },
      );
    }
    throw e;
  }
  if (res.affectedRows === 0) {
    return NextResponse.json({ ok: false, error: "Could not submit proof (wrong status or not assigned)" }, { status: 409 });
  }
  return NextResponse.json({ ok: true as const, status: "PENDING" });
}
