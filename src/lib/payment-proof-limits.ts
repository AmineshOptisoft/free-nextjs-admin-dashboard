import { Buffer } from "node:buffer";

/** Stored as TEXT; keep under common MySQL `max_allowed_packet` (wire size includes SQL). */
export const MAX_PAYMENT_IMAGE_UTF8_BYTES = 512 * 1024;

export const MAX_UTR_CODE_CHARS = 128;
export const MAX_USER_UPI_CHARS = 120;

export type ProofValidationResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

/** Reject oversized proof fields before hitting the DB (avoids ER_NET_PACKET_TOO_LARGE / 1153). */
export function validatePaymentProofPayload(input: {
  utr_code: string;
  payment_image: string;
  user_upi?: string;
}): ProofValidationResult {
  const utr = input.utr_code;
  const image = input.payment_image;
  const userUpi = input.user_upi ?? "";

  if (utr.length > MAX_UTR_CODE_CHARS) {
    return { ok: false, error: `UTR is too long (max ${MAX_UTR_CODE_CHARS} characters).`, status: 400 };
  }
  if (userUpi.length > MAX_USER_UPI_CHARS) {
    return { ok: false, error: `Payer UPI is too long (max ${MAX_USER_UPI_CHARS} characters).`, status: 400 };
  }
  if (image.length > 0) {
    const bytes = Buffer.byteLength(image, "utf8");
    if (bytes > MAX_PAYMENT_IMAGE_UTF8_BYTES) {
      const kb = Math.ceil(bytes / 1024);
      const maxKb = MAX_PAYMENT_IMAGE_UTF8_BYTES / 1024;
      return {
        ok: false,
        error: `Payment proof is too large (${kb} KB). Maximum is ${maxKb} KB — use a smaller screenshot, lower resolution, or submit UTR only.`,
        status: 413,
      };
    }
  }
  return { ok: true };
}

export function isMysqlPacketTooLarge(err: unknown): boolean {
  return typeof err === "object" && err !== null && "errno" in err && Number((err as { errno: unknown }).errno) === 1153;
}
