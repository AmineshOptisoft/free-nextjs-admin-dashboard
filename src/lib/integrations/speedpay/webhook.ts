import crypto from "crypto";
import { webhookSigningSecret } from "@/lib/webhook-signing";
import { mapSpeedpayPayinToInternalStatus } from "./mapper";

export type PayinWebhookBody = {
  event?: string;
  timestamp?: string;
  data?: {
    id?: number;
    transaction_number?: string;
    reference_number?: string | null;
    upi?: string;
    amount?: string;
    status?: string;
    image?: string | null;
    note?: string | null;
    reason?: string;
  };
};

export function readWebhookSignature(req: Request): string | null {
  return (
    req.headers.get("x-webhook-signature") ||
    req.headers.get("x-speedpay-signature") ||
    req.headers.get("x-signature") ||
    req.headers.get("signature")
  );
}

export function verifySpeedpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const key = webhookSigningSecret();
  if (!key || !signature) return false;
  const expected = crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function parseSpeedpayWebhook(rawBody: string): PayinWebhookBody {
  try {
    return JSON.parse(rawBody) as PayinWebhookBody;
  } catch {
    return {};
  }
}

export function webhookToInternalStatus(body: PayinWebhookBody): string {
  const event = String(body.event || "").trim().toLowerCase();
  if (event === "payin.completed") return "APPROVED";
  if (event === "payin.rejected") return "REJECTED";
  if (event === "payin.in_process") return "PENDING";
  if (event === "payin.initiated") return "PENDING";
  return mapSpeedpayPayinToInternalStatus(body.data?.status ?? "");
}
