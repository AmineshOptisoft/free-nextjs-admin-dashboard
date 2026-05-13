import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { payInDisplayStatus } from "@/lib/payin-lifecycle";

type TxRow = RowDataPacket & {
  id: number;
  order_id: string;
  amount: string | number;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  assigned_upi: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  utr_code: string | null;
  payment_image: string | null;
  pay_method_id: number | null;
  assigned_agent_id: number | null;
  payment_method: string;
  account_holder_name: string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

async function loadTx(txId: number): Promise<TxRow | null> {
  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`order_id\`, \`amount\`, \`status\`, \`client_name\`, \`client_upi\`, \`assigned_upi\`,
            \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`utr_code\`, \`payment_image\`,
            \`pay_method_id\`, \`assigned_agent_id\`, \`payment_method\`, \`account_holder_name\`
     FROM \`transactions\`
     WHERE \`id\` = ? AND \`type\` = 'PAYIN'
     LIMIT 1`,
    [txId],
  );
  return rows[0] ?? null;
}

function mapTx(tx: TxRow) {
  const dbStatus = String(tx.status ?? "").trim();
  const proofSubmitted = Boolean(
    (tx.utr_code && String(tx.utr_code).trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  return {
    id: String(tx.id),
    orderId: tx.order_id,
    amount: num(tx.amount),
    status: dbStatus,
    displayStatus: payInDisplayStatus(dbStatus),
    clientName: tx.client_name ?? "",
    clientUpi: tx.client_upi ?? "",
    assignedUpi: tx.assigned_upi ?? "",
    bankName: tx.bank_name ?? "",
    accountNo: tx.bank_account_number ?? "",
    ifsc: tx.ifsc_code ?? "",
    hasReceipt: Boolean(tx.payment_image && String(tx.payment_image).trim().length > 0),
    utrCode: tx.utr_code ?? "",
    paymentMethod: (tx.payment_method ?? "UPI").toString().toUpperCase() === "BANK" ? "BANK" : "UPI",
    accountHolderName: tx.account_holder_name ?? "",
    waitForAgent: dbStatus === "NOT_ASSIGNED" || !tx.pay_method_id || !tx.assigned_agent_id,
    proofSubmitted,
  };
}

export async function GET(_req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  const tx = await loadTx(txId);
  if (!tx) return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
  return NextResponse.json({ ok: true as const, request: mapTx(tx) });
}

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const tx = await loadTx(txId);
  if (!tx) return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
  if (String(tx.status).toUpperCase() !== "PENDING") {
    return NextResponse.json(
      { ok: false, error: `UTR/proof can only be submitted while status is PENDING (current: ${tx.status})` },
      { status: 409 },
    );
  }
  if (!tx.pay_method_id || !tx.assigned_agent_id) {
    return NextResponse.json({ ok: false, error: "Agent/account not assigned yet. Please wait." }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const utr = typeof body.utr_code === "string" ? body.utr_code.trim() : "";
  const image = typeof body.payment_image === "string" ? body.payment_image.trim() : "";
  const userUpi = typeof body.user_upi === "string" ? body.user_upi.trim() : "";
  if (!utr && !image) {
    return NextResponse.json({ ok: false, error: "Provide utr_code or payment_image" }, { status: 400 });
  }

  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE \`transactions\`
     SET \`utr_code\` = COALESCE(NULLIF(?, ''), \`utr_code\`),
         \`payment_image\` = COALESCE(NULLIF(?, ''), \`payment_image\`),
         \`user_upi\` = COALESCE(NULLIF(?, ''), \`user_upi\`)
     WHERE \`id\` = ? AND \`type\` = 'PAYIN' AND \`status\` = 'PENDING'
       AND \`pay_method_id\` IS NOT NULL AND \`assigned_agent_id\` IS NOT NULL`,
    [utr, image, userUpi, txId],
  );
  if (res.affectedRows === 0) {
    return NextResponse.json(
      { ok: false, error: "Could not save proof (status may have changed or row is not assignable)" },
      { status: 409 },
    );
  }
  const updated = await loadTx(txId);
  if (!updated) return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
  return NextResponse.json({ ok: true as const, request: mapTx(updated) });
}
