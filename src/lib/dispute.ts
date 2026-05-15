/** Dispute workflow: open disputes live only on Disputes; resolved items return to Pay In / Pay Out. */

export const OPEN_DISPUTE_STATES = new Set(["PENDING", "OTHER"]);

export function normalizeDisputeState(state: string | null | undefined): string {
  return String(state ?? "")
    .trim()
    .toUpperCase();
}

/** Transaction is actively in dispute (hidden from Pay In / Pay Out lists). */
export function isOpenDispute(disputeState: string | null | undefined, disputeRaised?: number | boolean | null): boolean {
  const ds = normalizeDisputeState(disputeState);
  if (OPEN_DISPUTE_STATES.has(ds)) return true;
  if (ds === "NONE" || ds === "RESOLVED" || ds === "EXPIRED") return false;
  return Number(disputeRaised ?? 0) === 1;
}

function col(alias: string | undefined, name: string): string {
  return alias ? `${alias}.\`${name}\`` : `\`${name}\``;
}

/** SQL fragment — exclude open disputes from Pay In / Pay Out listings. */
export function sqlExcludeOpenDispute(alias?: string): string {
  const ds = col(alias, "dispute_state");
  const dr = col(alias, "dispute_raised");
  return `(
    COALESCE(${ds}, 'NONE') NOT IN ('PENDING', 'OTHER')
    AND (${dr} = 0 OR COALESCE(${ds}, 'NONE') IN ('NONE', 'RESOLVED', 'EXPIRED'))
  )`;
}

/** Legacy DB without dispute_state column. */
export function sqlExcludeOpenDisputeLegacy(alias?: string): string {
  return `${col(alias, "dispute_raised")} = 0`;
}

/** Disputes page: only open disputes. */
export function sqlOnlyOpenDispute(alias?: string): string {
  const ds = col(alias, "dispute_state");
  const dr = col(alias, "dispute_raised");
  return `(
    ${ds} IN ('PENDING', 'OTHER')
    OR (${dr} = 1 AND COALESCE(${ds}, 'NONE') NOT IN ('NONE', 'RESOLVED', 'EXPIRED'))
  )`;
}

export function sqlOnlyOpenDisputeLegacy(alias?: string): string {
  return `${col(alias, "dispute_raised")} = 1`;
}

/** @deprecated use sqlExcludeOpenDispute() */
export const SQL_EXCLUDE_OPEN_DISPUTE = sqlExcludeOpenDispute();
/** @deprecated use sqlExcludeOpenDisputeLegacy() */
export const SQL_EXCLUDE_OPEN_DISPUTE_LEGACY = sqlExcludeOpenDisputeLegacy();

export const DISPUTE_BLOCKS_ACTION_MSG =
  "This request is in dispute. Resolve it from Disputes before approve, reject, or assign.";

export function isMissingDisputeStateColumn(e: unknown): boolean {
  const errno = (e as { errno?: number })?.errno;
  const msg = String((e as { sqlMessage?: string })?.sqlMessage ?? (e as Error)?.message ?? "");
  return errno === 1054 && msg.toLowerCase().includes("dispute_state");
}
