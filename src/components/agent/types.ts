export type Agent = {
  id: string;
  fullname: string | null;
  username: string;
  email: string | null;
  security_deposit: number;
  credit_limit: number;
  net_pay_in: number;
  net_pay_out: number;
  pay_in_commission: number;
  pay_out_commission: number;
  referral_commission: number;
  /** Auto-generated vendor referral / tracking code */
  referral_code: string;
  status: string;
};

export type AgentDetailApi = Agent & {
  previous_balance: number;
  running_balance: number;
  settlement_amount: number;
  settlement_date: number | string | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
};
