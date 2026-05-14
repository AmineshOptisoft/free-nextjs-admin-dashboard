const DEFAULT_MINUTES = 10;
const MAX_MINUTES = 7 * 24 * 60;

/**
 * Minutes to wait after admin assigns a payout before the assigned agent may approve it (PENDING → APPROVED_BY_AGENT).
 * Set `PAYOUT_AGENT_APPROVE_DELAY_MINUTES` in `.env` / hosting env. Use `0` to disable the wait.
 */
export function getPayoutAgentApproveDelayMinutesFromEnv(): number {
  const raw = process.env.PAYOUT_AGENT_APPROVE_DELAY_MINUTES;
  if (raw == null || String(raw).trim() === "") return DEFAULT_MINUTES;
  const n = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_MINUTES;
  if (n > MAX_MINUTES) return MAX_MINUTES;
  return n;
}

function assignedAtMs(assignedDate: Date | string | null | undefined): number | null {
  if (assignedDate == null) return null;
  const t = typeof assignedDate === "string" ? new Date(assignedDate).getTime() : assignedDate.getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Server guard: block agent approving from PENDING until assignment time + delay.
 * Other paths (e.g. PAID → APPROVED_BY_AGENT) are not delayed.
 */
export function agentPayoutApproveDelayViolation(
  fromStatus: string,
  toStatus: string,
  assignedDate: Date | string | null | undefined,
  nowMs: number = Date.now(),
): { blocked: false } | { blocked: true; retryAfterIso: string; waitMinutes: number } {
  const delayMin = getPayoutAgentApproveDelayMinutesFromEnv();
  if (delayMin === 0) return { blocked: false };
  if (String(toStatus).toUpperCase() !== "APPROVED_BY_AGENT") return { blocked: false };
  if (String(fromStatus).toUpperCase() !== "PENDING") return { blocked: false };

  const ams = assignedAtMs(assignedDate);
  if (ams == null) return { blocked: false };

  const eligibleMs = ams + delayMin * 60_000;
  if (nowMs >= eligibleMs) return { blocked: false };

  return {
    blocked: true,
    retryAfterIso: new Date(eligibleMs).toISOString(),
    waitMinutes: delayMin,
  };
}
