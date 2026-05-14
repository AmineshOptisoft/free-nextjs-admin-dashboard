import type { AgentPayOutListItem } from "@/lib/agent-transactions-map";

/** Client: agent may show Approve when status allows and assignment delay has passed (uses API-supplied minutes). */
export function isAgentPayoutApproveUnlocked(
  item: Pick<AgentPayOutListItem, "status" | "assignedAtIso">,
  delayMinutes: number,
  nowMs: number = Date.now(),
): boolean {
  if (delayMinutes <= 0) return true;
  if (item.status === "PROCESSING") return true;
  if (item.status !== "PENDING") return true;
  const iso = item.assignedAtIso?.trim();
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return true;
  return nowMs >= t + delayMinutes * 60_000;
}
