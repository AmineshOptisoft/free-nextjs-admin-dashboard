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

export type UserRealtimePayload = {
  userId: string;
  role: "agent" | "company";
  status: string;
  updatedAt: string;
};

export const TRANSACTION_UPDATE_EVENT = "transaction:update" as const;
export const USER_UPDATE_EVENT = "user:update" as const;
