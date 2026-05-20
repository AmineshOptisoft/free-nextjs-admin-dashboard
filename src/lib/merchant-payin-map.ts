import { formatPayinImageForApi } from "@/lib/payment-proof-storage";

export type MerchantPayinStatusData = {
  id: number;
  reference_number: string | null;
  transaction_number: string;
  upi: string;
  amount: string;
  status: "INITIATE" | "IN_PROCESS" | "COMPLETED" | "REJECTED";
  image: string | null;
  note: string | null;
};

export type MerchantPayinCreateData = Omit<MerchantPayinStatusData, "amount"> & {
  amount: number;
  redirect_url: string;
  return_url: string | null;
};

type TxLike = {
  id: number | string;
  order_id: string;
  amount: string | number;
  status: string;
  assigned_upi: string | null;
  utr_code: string | null;
  payment_image: string | null;
  user_note: string | null;
};

export function encodeCompanyKey(raw: string): string {
  const input = String(raw || "").trim();
  if (!input) return "";
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function buildPayinRedirectUrl(origin: string, companyCode: string, txId: number): string {
  const base = origin.replace(/\/+$/, "");
  const key = encodeCompanyKey(companyCode);
  return `${base}/pay/${key}?request=${txId}`;
}

export function mapInternalStatusToGateway(status: string, proofSubmitted = false): MerchantPayinStatusData["status"] {
  const s = String(status || "").trim().toUpperCase();
  if (s.includes("APPROVED")) return "COMPLETED";
  if (s === "REJECTED" || s === "REVOKED" || s === "DECLINED" || s === "EXPIRED") return "REJECTED";
  if (proofSubmitted || s === "PENDING") return "IN_PROCESS";
  return "INITIATE";
}

export function txToMerchantPayinStatusData(tx: TxLike): MerchantPayinStatusData {
  const proofSubmitted = Boolean(
    (tx.utr_code && String(tx.utr_code).trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  const amount = Number(tx.amount);
  return {
    id: Number(tx.id),
    reference_number: tx.utr_code?.trim() || null,
    transaction_number: String(tx.order_id || ""),
    upi: tx.assigned_upi?.trim() || "",
    amount: (Number.isFinite(amount) ? amount : 0).toFixed(2),
    status: mapInternalStatusToGateway(tx.status, proofSubmitted),
    image: formatPayinImageForApi(tx.payment_image),
    note: tx.user_note?.trim() || null,
  };
}

export function txToMerchantPayinData(
  tx: TxLike,
  opts: {
    origin: string;
    companyCode: string;
    return_url?: string | null;
    forceStatus?: MerchantPayinCreateData["status"];
  },
): MerchantPayinCreateData {
  const proofSubmitted = Boolean(
    (tx.utr_code && String(tx.utr_code).trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  const amount = Number(tx.amount);
  const status = opts.forceStatus ?? mapInternalStatusToGateway(tx.status, proofSubmitted);
  return {
    id: Number(tx.id),
    reference_number: tx.utr_code?.trim() || null,
    transaction_number: String(tx.order_id || ""),
    upi: tx.assigned_upi?.trim() || "",
    amount: Number.isFinite(amount) ? amount : 0,
    status,
    image: formatPayinImageForApi(tx.payment_image),
    note: tx.user_note?.trim() || null,
    redirect_url: buildPayinRedirectUrl(opts.origin, opts.companyCode, Number(tx.id)),
    return_url: opts.return_url ?? null,
  };
}

export function merchantSuccess<T>(message: string, data: T) {
  return { success: true as const, message, data };
}

export function merchantError(message: string, status: number) {
  return { body: { success: false as const, message }, status };
}
