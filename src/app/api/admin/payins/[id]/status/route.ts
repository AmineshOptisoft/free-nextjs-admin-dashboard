import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { applyAgentLedgerForTransactionStatusChange } from "@/lib/agent-ledger";
import { pool } from "@/lib/db";
import { paymentImageDbLimitMessage, paymentImageExceedsDbLimit } from "@/lib/payment-image-db-limit";
import { canAdminVerifyPayIn } from "@/lib/payin-lifecycle";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  status: string;
  payment_image: string | null;
  amount: string | number;
  assigned_agent_id: number | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
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
  const toStatus = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
  const utrCode = typeof body.utr_code === "string" ? body.utr_code.trim() : "";
  const paymentImage = typeof body.payment_image === "string" ? body.payment_image.trim() : "";
  if (!toStatus) {
    return NextResponse.json({ ok: false, error: "status is required" }, { status: 400 });
  }

  if (paymentImage && paymentImageExceedsDbLimit(paymentImage)) {
    return NextResponse.json({ ok: false, error: paymentImageDbLimitMessage() }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<TxRow[]>(
      `SELECT \`id\`, \`status\`, \`payment_image\`, \`amount\`, \`assigned_agent_id\`
       FROM \`transactions\`
       WHERE \`id\` = ? AND \`type\` = 'PAYIN'
       LIMIT 1 FOR UPDATE`,
      [txId],
    );
    const tx = rows[0];
    if (!tx) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "PayIn not found" }, { status: 404 });
    }

    if (!canAdminVerifyPayIn(tx.status, toStatus)) {
      await conn.rollback();
      return NextResponse.json(
        { ok: false, error: `Invalid status change from ${tx.status} to ${toStatus}` },
        { status: 409 },
      );
    }

    const existingProof = String(tx.payment_image ?? "").trim().length > 0;
    const proofToStore = paymentImage || (existingProof ? String(tx.payment_image ?? "").trim() : "");
    if (toStatus === "APPROVED_BY_ADMIN" && !proofToStore) {
      await conn.rollback();
      return NextResponse.json(
        { ok: false, error: "Upload proof (screenshot) or ensure payer proof exists before approving." },
        { status: 400 },
      );
    }

    await applyAgentLedgerForTransactionStatusChange(conn, {
      assignedAgentId: tx.assigned_agent_id,
      txType: "PAYIN",
      fromStatus: tx.status,
      toStatus,
      amount: num(tx.amount),
    });

    const setParts: string[] = ["`status` = ?"];
    const params: unknown[] = [toStatus];
    if (utrCode) {
      setParts.push("`utr_code` = COALESCE(NULLIF(?, ''), `utr_code`)");
      params.push(utrCode);
    }
    if (paymentImage) {
      setParts.push("`payment_image` = ?");
      params.push(paymentImage);
    }
    params.push(txId, tx.status);

    const [res] = await conn.execute<ResultSetHeader>(
      `UPDATE \`transactions\` SET ${setParts.join(", ")} WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND \`status\` = ?`,
      params as (string | number)[],
    );
    if (res.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Could not update payin status" }, { status: 500 });
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not update payin (ledger or status conflict)" }, { status: 500 });
  } finally {
    conn.release();
  }

  return NextResponse.json({ ok: true as const, status: toStatus });
}
