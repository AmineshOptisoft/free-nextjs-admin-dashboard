import crypto from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import { formatPayinImageForApi } from "@/lib/payment-proof-storage";
import { webhookSigningSecret } from "@/lib/webhook-signing";
import { pool } from "@/lib/db";

export type PayinWebhookEvent =
  | "payin.initiated"
  | "payin.in_process"
  | "payin.completed"
  | "payin.rejected";

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

export type PayinWebhookPayload = {
  event: PayinWebhookEvent;
  timestamp: string;
  data: {
    id: number;
    reference_number: string | null;
    transaction_number: string;
    upi: string;
    amount: string;
    status: "INITIATE" | "IN_PROCESS" | "COMPLETED" | "REJECTED";
    image: string | null;
    note: string | null;
    reason?: string;
  };
};

const RETRY_DELAYS_MS = [2000, 5000, 15000];

function webhookSigningKey(): string | null {
  return webhookSigningSecret();
}

/** Single global URL for all PayIn webhook notifications (set in .env). */
function merchantWebhookUrl(): string | null {
  return process.env.MERCHANT_WEBHOOK_URL?.trim() || null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatAmount(v: string | number): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function formatPayinImage(raw: string | null | undefined): string | null {
  return formatPayinImageForApi(raw);
}

export function statusForPayinWebhookEvent(event: PayinWebhookEvent): PayinWebhookPayload["data"]["status"] {
  switch (event) {
    case "payin.completed":
      return "COMPLETED";
    case "payin.rejected":
      return "REJECTED";
    case "payin.in_process":
      return "IN_PROCESS";
    default:
      return "INITIATE";
  }
}

export function payinWebhookEventForStatus(status: string, proofSubmitted = false): PayinWebhookEvent {
  const s = String(status || "").trim().toUpperCase();
  if (s.includes("APPROVED")) return "payin.completed";
  if (s === "REJECTED" || s === "REVOKED" || s === "DECLINED" || s === "EXPIRED") return "payin.rejected";
  if (proofSubmitted || s === "PENDING") return "payin.in_process";
  return "payin.initiated";
}

export function buildPayinWebhookPayload(
  tx: TxRow,
  event: PayinWebhookEvent,
  reason?: string,
): PayinWebhookPayload {
  const payload: PayinWebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      id: Number(tx.id),
      reference_number: tx.utr_code?.trim() || null,
      transaction_number: String(tx.order_id || ""),
      upi: tx.assigned_upi?.trim() || "",
      amount: formatAmount(tx.amount),
      status: statusForPayinWebhookEvent(event),
      image: formatPayinImage(tx.payment_image),
      note: tx.user_note?.trim() || null,
    },
  };
  if (reason?.trim()) payload.data.reason = reason.trim();
  return payload;
}

export async function sendPayinWebhook(payload: PayinWebhookPayload, webhookUrl: string): Promise<void> {
  const url = webhookUrl.trim();
  const key = webhookSigningKey();
  if (!url || !key) return;

  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  const headers = {
    "Content-Type": "application/json",
    "x-webhook-signature": signature,
    "x-webhook-timestamp": payload.timestamp,
  };

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]!);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: rawBody,
        cache: "no-store",
      });
      if (res.ok) return;
    } catch {
      // retry
    }
  }
}

async function loadPayinTx(txId: number): Promise<TxRow | null> {
  const [rows] = await pool.execute<TxRow[]>(
    `SELECT \`id\`, \`company_id\`, \`order_id\`, \`amount\`, \`status\`, \`assigned_upi\`, \`utr_code\`, \`payment_image\`, \`user_note\`
     FROM \`transactions\`
     WHERE \`id\` = ? AND \`type\` = 'PAYIN'
     LIMIT 1`,
    [txId],
  );
  return rows[0] ?? null;
}

async function dispatchPayinWebhook(tx: TxRow, event: PayinWebhookEvent, reason?: string): Promise<void> {
  const webhookUrl = merchantWebhookUrl();
  if (!webhookUrl) return;

  const payload = buildPayinWebhookPayload(tx, event, reason);
  await sendPayinWebhook(payload, webhookUrl);
}

export async function sendPayinWebhookForTx(
  txId: number,
  opts?: { event?: PayinWebhookEvent; reason?: string },
): Promise<void> {
  const tx = await loadPayinTx(txId);
  if (!tx) return;

  const proofSubmitted = Boolean(
    (tx.utr_code && tx.utr_code.trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  const event = opts?.event ?? payinWebhookEventForStatus(tx.status, proofSubmitted);
  await dispatchPayinWebhook(tx, event, opts?.reason);
}

export async function sendPayinWebhookForTxStatusChange(
  txId: number,
  newStatus: string,
  reason?: string,
): Promise<void> {
  const tx = await loadPayinTx(txId);
  if (!tx) return;

  const proofSubmitted = Boolean(
    (tx.utr_code && tx.utr_code.trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  const event = payinWebhookEventForStatus(newStatus, proofSubmitted);
  await dispatchPayinWebhook(tx, event, reason);
}
