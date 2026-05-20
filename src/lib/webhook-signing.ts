/** HMAC secret for outbound PayIn webhooks (PDF: signed with merchant API key). */
export function webhookSigningSecret(): string | null {
  return process.env.WEBHOOK_SIGNING_SECRET?.trim() || process.env.SPEEDPAY_API_KEY?.trim() || null;
}
