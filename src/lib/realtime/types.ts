export type TransactionRealtimeAction =
  | "status"
  | "assign"
  | "dispute"
  | "proof"
  | "create";

export type TransactionRealtimePayload = {
  id: string;
  type: "PAYIN" | "PAYOUT";
  status: string;
  disputeRaised: boolean;
  disputeState: string;
  assignedAgentId: number | null;
  companyId: number | null;
  action: TransactionRealtimeAction;
  updatedAt: string;
};

export const TRANSACTION_UPDATE_EVENT = "transaction:update" as const;
