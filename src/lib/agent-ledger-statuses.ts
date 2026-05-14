/**
 * "Settled" for agent `net_*` / `running_balance` updates: approved outcomes only (no `PAID` proof-wait state).
 * Transitions among non-settled states (e.g. APPROVED_BY_AGENT ↔ PAID) do not move the ledger.
 */
export const AGENT_SETTLED_LEDGER_STATUSES = [
  "APPROVED",
  "APPROVED_BY_AGENT",
  "APPROVED_BY_ADMIN",
  "EXPIRED_APPROVED_BY_ADMIN",
  "EXPIRED_APPROVED_BY_AGENT",
] as const;

export function isAgentSettledLedgerStatus(statusRaw: string | null | undefined): boolean {
  const s = String(statusRaw ?? "").trim().toUpperCase();
  return (AGENT_SETTLED_LEDGER_STATUSES as readonly string[]).includes(s);
}

/** SQL `IN (...)` for settled statuses (uppercase). */
export const AGENT_SETTLED_LEDGER_SQL_IN = `('APPROVED','APPROVED_BY_AGENT','APPROVED_BY_ADMIN','EXPIRED_APPROVED_BY_ADMIN','EXPIRED_APPROVED_BY_AGENT')`;

/** PayIn amounts in agent-handled pipeline but not yet settled (excludes `PAID`). */
export const MANUAL_PAYIN_STATUS_SQL_IN = `('PENDING','RECEIPT_PENDING','PROCESSING','RE_ASSIGNED')`;
