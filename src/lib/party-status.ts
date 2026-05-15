/** Agent / company status helpers for assignment and public pay. */

export function normalizePartyStatus(status: string | null | undefined): string {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

/** Only active agents receive auto or manual PayIn / PayOut assignment. */
export function isAgentActiveForAssignment(status: string | null | undefined): boolean {
  return normalizePartyStatus(status) === "ACTIVE";
}

/** Only ACTIVE companies accept public or portal PayIn requests. */
export function isCompanyAcceptingPayments(status: string | null | undefined): boolean {
  return normalizePartyStatus(status) === "ACTIVE";
}

export function companyPaymentsBlockMessage(status: string | null | undefined): string {
  const s = normalizePartyStatus(status);
  if (s === "BLOCKED") {
    return "This company cannot accept payment requests right now because the account has been blocked.";
  }
  if (s === "DEACTIVATED") {
    return "This company cannot accept payment requests right now because the account has been deactivated.";
  }
  if (s === "PENDING") {
    return "This company cannot accept payment requests right now because the account is not yet active.";
  }
  return "This company cannot accept payment requests at the moment. Please try again later.";
}

export const AGENT_BLOCKED_ASSIGN_MSG =
  "This agent is blocked or inactive. Activate the agent before assigning requests.";
