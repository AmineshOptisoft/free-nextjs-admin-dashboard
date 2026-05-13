const ASSIGNABLE = new Set(["NOT_ASSIGNED", "RE_ASSIGNED", "PENDING"]);
const PROOF_ALLOWED = new Set(["PENDING", "RE_ASSIGNED"]);

const AGENT_ALLOWED_FROM: Record<string, Set<string>> = {
  APPROVED_BY_AGENT: new Set(["PAID", "PENDING", "RE_ASSIGNED", ""]),
  REJECTED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  EXPIRED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  RE_ASSIGNED: new Set(["PENDING", "PAID"]),
};

const ADMIN_ALLOWED_FROM: Record<string, Set<string>> = {
  APPROVED_BY_ADMIN: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  REJECTED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  EXPIRED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  RE_ASSIGNED: new Set(["PENDING", "PAID"]),
};

export function canAssignPayIn(status: string): boolean {
  return ASSIGNABLE.has(String(status ?? "").trim().toUpperCase());
}

export function canSubmitPayInProof(status: string): boolean {
  return PROOF_ALLOWED.has(String(status ?? "").trim().toUpperCase());
}

export function canAgentVerifyPayIn(from: string, to: string): boolean {
  const fromNorm = String(from ?? "").trim().toUpperCase();
  const toNorm = String(to ?? "").trim().toUpperCase();
  const set = AGENT_ALLOWED_FROM[toNorm];
  if (!set) return false;
  return set.has(fromNorm);
}

export function canAdminVerifyPayIn(from: string, to: string): boolean {
  const fromNorm = String(from ?? "").trim().toUpperCase();
  const toNorm = String(to ?? "").trim().toUpperCase();
  const set = ADMIN_ALLOWED_FROM[toNorm];
  if (!set) return false;
  return set.has(fromNorm);
}

/** Public/client UX: DB NOT_ASSIGNED → waiting copy for company pay link polling. */
export function payInDisplayStatus(dbStatus: string): string {
  const s = String(dbStatus ?? "").trim().toUpperCase();
  return s === "NOT_ASSIGNED" ? "WAITING_FOR_AGENT" : s;
}

/** mysql2 may return VARCHAR as string or Buffer — safe for JSON responses. */
export function sqlFieldToUtf8(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(v)) return v.toString("utf8");
  return String(v);
}

type PayInMethodInputs = {
  payment_method?: unknown;
  assigned_upi?: unknown;
  qr_code_url?: unknown;
  bank_name?: unknown;
  bank_account_number?: unknown;
  ifsc_code?: unknown;
};

/**
 * BANK vs UPI for public/company pay UI.
 * DB `payment_method` is not always the literal "BANK" (e.g. NEFT/IMPS), and some rows only have bank snapshots.
 */
export function publicPayInDisplayMethod(tx: PayInMethodInputs): "UPI" | "BANK" {
  const pm = sqlFieldToUtf8(tx.payment_method).trim().toUpperCase();
  if (
    pm === "BANK" ||
    pm === "NEFT" ||
    pm === "IMPS" ||
    pm === "RTGS" ||
    pm === "NETBANKING" ||
    pm === "WIRE"
  ) {
    return "BANK";
  }
  const bankSnap =
    sqlFieldToUtf8(tx.bank_name).trim().length > 0 ||
    sqlFieldToUtf8(tx.bank_account_number).trim().length > 0 ||
    sqlFieldToUtf8(tx.ifsc_code).trim().length > 0;
  const qrRaw = sqlFieldToUtf8(tx.qr_code_url).trim();
  const upiSnap =
    sqlFieldToUtf8(tx.assigned_upi).trim().length > 0 || qrRaw.toLowerCase().startsWith("upi://");
  if (bankSnap && !upiSnap) return "BANK";
  return "UPI";
}
