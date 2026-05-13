import type { RowDataPacket } from "mysql2/promise";
import type { PayMethodFinancial } from "@/lib/transactions-pay-method-financials";
import { emptyPayMethodFinancial } from "@/lib/transactions-pay-method-financials";

/** Row shape for `pay_methods` used by agent payment-method APIs. */
export type PayMethodRow = RowDataPacket & {
  id: number;
  agent_id: number | null;
  full_name: string;
  username: string | null;
  email: string | null;
  upi_id: string | null;
  payment_method: "UPI" | "BANK" | string;
  account_no: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  bank_name: string | null;
  account_holder_name: string | null;
  enable_pay_in: number | boolean;
  enable_pay_out: number | boolean;
  status: string;
  last_activity: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export function boolPay(v: number | boolean): boolean {
  return v === true || v === 1;
}

export function gatewayToPaymentMethod(gateway: string): "UPI" | "BANK" {
  if (gateway === "Bank Transfer Only") return "BANK";
  return "UPI";
}

export function paymentMethodToGateway(pm: string): string {
  return pm === "BANK" ? "Bank Transfer Only" : "UPI Only";
}

function operationTypeFromFlags(payIn: boolean, payOut: boolean): string {
  if (payIn && payOut) return "PayIn & PayOut";
  if (payIn) return "PayIn Only";
  if (payOut) return "PayOut Only";
  return "PayIn & PayOut";
}

function lastSeenLabel(last: Date | string | null): string {
  if (last == null) return "Never";
  const d = typeof last === "string" ? new Date(last) : last;
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
}

/** API payload expected by `UsersList` / `CreateUserModal`. `financial` comes from `transactions`. */
export function payMethodToStaffApi(r: PayMethodRow, assignedTo: string, financial?: PayMethodFinancial) {
  const payIn = boolPay(r.enable_pay_in);
  const payOut = boolPay(r.enable_pay_out);
  const pm = r.payment_method === "BANK" ? "BANK" : "UPI";
  const tags = [pm];
  if (payIn) tags.push("PAYIN");
  if (payOut) tags.push("PAYOUT");

  const statusLower = r.status === "ACTIVE" ? "active" : "inactive";

  return {
    id: String(r.id),
    fullname: r.full_name ?? "",
    username: (r.username ?? "").trim() || String(r.id),
    email: r.email,
    phone: null as string | null,
    role_label: "Payment method",
    pay_in_enabled: payIn,
    pay_out_enabled: payOut,
    operation_type: operationTypeFromFlags(payIn, payOut),
    gateway: paymentMethodToGateway(pm),
    tags,
    status: statusLower,
    last_seen_label: lastSeenLabel(r.last_activity),
    assigned_to: assignedTo,
    created_at: r.created_at,
    updated_at: r.updated_at,
    upi_id: (r.upi_id ?? "").trim() || null,
    bank_name: (r.bank_name ?? "").trim() || null,
    account_no: (r.account_no ?? "").trim() || null,
    ifsc_code: (r.ifsc_code ?? "").trim() || null,
    branch_name: (r.branch_name ?? "").trim() || null,
    account_holder_name: (r.account_holder_name ?? "").trim() || null,
    financial: financial ?? emptyPayMethodFinancial(),
  };
}
export const PAY_METHOD_SELECT = `
  \`id\`, \`agent_id\`, \`full_name\`, \`username\`, \`email\`, \`upi_id\`, \`payment_method\`,
  \`account_no\`, \`ifsc_code\`, \`branch_name\`, \`bank_name\`, \`account_holder_name\`,
  \`enable_pay_in\`, \`enable_pay_out\`, \`status\`, \`last_activity\`, \`created_at\`, \`updated_at\`
`;
