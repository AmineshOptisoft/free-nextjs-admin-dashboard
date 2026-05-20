import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { isAgentSettledLedgerStatus } from "@/lib/agent-ledger-statuses";

export { isAgentSettledLedgerStatus as statusCountsTowardAgentLedger };

function amountDeltaForTransition(
  txType: "PAYIN" | "PAYOUT",
  fromStatus: string,
  toStatus: string,
  amount: number,
): { dNetPayIn: number; dNetPayOut: number } {
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
  if (amt <= 0) return { dNetPayIn: 0, dNetPayOut: 0 };
  const was = isAgentSettledLedgerStatus(fromStatus) ? 1 : 0;
  const now = isAgentSettledLedgerStatus(toStatus) ? 1 : 0;
  const step = now - was;
  if (step === 0) return { dNetPayIn: 0, dNetPayOut: 0 };
  const delta = amt * step;
  if (txType === "PAYIN") return { dNetPayIn: delta, dNetPayOut: 0 };
  return { dNetPayIn: 0, dNetPayOut: delta };
}

type DbExec = Pick<PoolConnection, "execute">;

/**
 * Updates `agents.net_pay_in`, `agents.net_pay_out`, and `agents.running_balance`
 * when a transaction moves between settled and non-settled states (`PAID` is not settled here).
 * Call inside the same DB transaction as the `transactions` status update.
 *
 * Invariants (after each call): `running_balance = previous_balance + net_pay_in - net_pay_out`
 * (`net_pay_in` = approved pay-in received by agent, `net_pay_out` = approved pay-out sent; net = in − out).
 */
export async function applyAgentLedgerForTransactionStatusChange(
  exec: DbExec,
  args: {
    assignedAgentId: number | null | undefined;
    txType: "PAYIN" | "PAYOUT";
    fromStatus: string;
    toStatus: string;
    amount: number;
  },
): Promise<void> {
  const agentId = args.assignedAgentId == null ? 0 : Number(args.assignedAgentId);
  if (!Number.isInteger(agentId) || agentId < 1) return;

  const { dNetPayIn, dNetPayOut } = amountDeltaForTransition(
    args.txType,
    args.fromStatus,
    args.toStatus,
    args.amount,
  );
  if (dNetPayIn === 0 && dNetPayOut === 0) return;

  const [result] = await exec.execute<ResultSetHeader>(
    `UPDATE \`agents\`
     SET \`net_pay_in\` = \`net_pay_in\` + ?,
         \`net_pay_out\` = \`net_pay_out\` + ?,
         \`running_balance\` = \`running_balance\` + ?
     WHERE \`id\` = ?`,
    [dNetPayIn, dNetPayOut, dNetPayIn - dNetPayOut, agentId],
  );
  if (result.affectedRows !== 1) {
    throw new Error("AGENT_LEDGER_UPDATE_FAILED");
  }
}
