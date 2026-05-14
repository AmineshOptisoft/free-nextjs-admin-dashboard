/** Keep base64/data URL payloads under typical MySQL `max_allowed_packet` (avoids ER_NET_PACKET_TOO_LARGE). */
export const MAX_PAYMENT_IMAGE_CHARS = 1_200_000;

export function paymentImageExceedsDbLimit(paymentImage: string): boolean {
  return paymentImage.length > MAX_PAYMENT_IMAGE_CHARS;
}

export function paymentImageDbLimitMessage(): string {
  return "Payment proof is too large to save. Use a smaller image or a clearer photo under ~1 MB.";
}
