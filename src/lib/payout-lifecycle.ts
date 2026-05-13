const ASSIGNABLE = new Set(["NOT_ASSIGNED", "RE_ASSIGNED", "PENDING"]);
const COMPANY_EDITABLE = new Set(["NOT_ASSIGNED", "PENDING"]);

/** Company can modify/delete payout only while still pending/unassigned. */
export function canCompanyEditOrDelete(status: string): boolean {
  return COMPANY_EDITABLE.has(status);
}

/** Admin can assign when payout is waiting or re-assigned. */
export function canAdminAssign(status: string): boolean {
  return ASSIGNABLE.has(status);
}

const AGENT_ALLOWED_FROM: Record<string, Set<string>> = {
  PAID: new Set(["PENDING", "RE_ASSIGNED"]),
  APPROVED_BY_AGENT: new Set(["PAID", "EXPIRED"]),
  REJECTED: new Set(["PENDING", "PAID", "RE_ASSIGNED"]),
  REVOKED: new Set(["PENDING", "PAID", "RE_ASSIGNED"]),
  RE_ASSIGNED: new Set(["PENDING", "PAID"]),
};

/** Agent transition guard for payout statuses. */
export function canAgentTransition(from: string, to: string): boolean {
  const set = AGENT_ALLOWED_FROM[to];
  if (!set) return false;
  return set.has(from);
}
