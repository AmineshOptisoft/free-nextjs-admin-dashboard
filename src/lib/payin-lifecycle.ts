const ASSIGNABLE = new Set(["NOT_ASSIGNED", "RE_ASSIGNED", "PENDING"]);
const PROOF_ALLOWED = new Set(["PENDING", "RE_ASSIGNED"]);

const AGENT_ALLOWED_FROM: Record<string, Set<string>> = {
  APPROVED_BY_AGENT: new Set(["PAID", "PENDING", "RE_ASSIGNED", ""]),
  REJECTED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  EXPIRED: new Set(["PAID", "PENDING", "RE_ASSIGNED"]),
  RE_ASSIGNED: new Set(["PENDING", "PAID"]),
};

const ADMIN_ALLOWED_FROM: Record<string, Set<string>> = {
  APPROVED_BY_ADMIN: new Set(["PAID", "PENDING"]),
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
