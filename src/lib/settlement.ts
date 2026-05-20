import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { AGENT_SETTLED_LEDGER_SQL_IN } from "@/lib/agent-ledger-statuses";

export type SettlementPartyType = "AGENT" | "COMPANY";

export const SETTLEMENT_MIGRATION_HINT =
  "Run database/migrations/007_settlements.sql (creates agent_settlements and company_settlements).";

export function settlementTableFor(partyType: SettlementPartyType): "agent_settlements" | "company_settlements" {
  return partyType === "AGENT" ? "agent_settlements" : "company_settlements";
}

export function isSettlementTableMissing(e: unknown): boolean {
  const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
  return code === "ER_NO_SUCH_TABLE";
}
export type SettlementStatus = "pending" | "settled" | "failed";
export type SettlementType = "FULL" | "PARTIAL" | "NET";
export type CommissionHead = "ALL" | "PAYIN" | "PAYOUT" | "REFERRAL";
export type SettlementTxnType = "DEBIT" | "CREDIT";
export type SettlementFrequency = "manual" | "daily" | "weekly";

export type SettlementPreview = {
  partyType: SettlementPartyType;
  partyId: number;
  partyName: string;
  periodFrom: string | null;
  periodTo: string | null;
  payInVolume: number;
  payOutVolume: number;
  payInCommissionPct: number;
  payOutCommissionPct: number;
  referralCommissionPct: number;
  payInCommissionAmount: number;
  payOutCommissionAmount: number;
  referralCommissionAmount: number;
  previousBalanceSnapshot: number;
  runningBalanceSnapshot: number;
  netVolume: number;
  suggestedFinalAmount: number;
};

type AgentRow = RowDataPacket & {
  id: number;
  fullname: string | null;
  username: string;
  previous_balance: string | number;
  running_balance: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  pay_in_commission: string | number;
  pay_out_commission: string | number;
  referral_commission: string | number;
};

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string | null;
  net_pay_in: string | number;
  net_pay_out: string | number;
  commission: string | number;
};

type VolRow = RowDataPacket & {
  pay_in_volume: string | number | null;
  pay_out_volume: string | number | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function pctAmount(volume: number, pct: number): number {
  if (volume <= 0 || pct <= 0) return 0;
  return Math.round(volume * (pct / 100) * 100) / 100;
}

function periodClause(alias: string, from: Date | null, to: Date | null): { sql: string; params: (string | Date)[] } {
  const parts: string[] = [];
  const params: (string | Date)[] = [];
  if (from) {
    parts.push(`${alias}.\`created_at\` >= ?`);
    params.push(from);
  }
  if (to) {
    parts.push(`${alias}.\`created_at\` <= ?`);
    params.push(to);
  }
  return { sql: parts.length ? parts.join(" AND ") : "1=1", params };
}

async function volumeForAgent(
  pool: Pool,
  agentId: number,
  from: Date | null,
  to: Date | null,
): Promise<{ payIn: number; payOut: number }> {
  const period = periodClause("t", from, to);
  const [rows] = await pool.execute<VolRow[]>(
    `SELECT
       COALESCE(SUM(CASE
         WHEN t.\`type\` = 'PAYIN' AND UPPER(TRIM(t.\`status\`)) IN ${AGENT_SETTLED_LEDGER_SQL_IN}
         THEN CAST(t.\`amount\` AS DECIMAL(18,2)) ELSE 0 END), 0) AS pay_in_volume,
       COALESCE(SUM(CASE
         WHEN t.\`type\` = 'PAYOUT'
          AND UPPER(TRIM(t.\`status\`)) IN ${AGENT_SETTLED_LEDGER_SQL_IN}
         THEN CAST(t.\`amount\` AS DECIMAL(18,2)) ELSE 0 END), 0) AS pay_out_volume
     FROM \`transactions\` t
     WHERE t.\`assigned_agent_id\` = ? AND (${period.sql})`,
    [agentId, ...period.params],
  );
  const r = rows[0];
  return { payIn: num(r?.pay_in_volume), payOut: num(r?.pay_out_volume) };
}

async function volumeForCompany(
  pool: Pool,
  companyId: number,
  from: Date | null,
  to: Date | null,
): Promise<{ payIn: number; payOut: number }> {
  const period = periodClause("t", from, to);
  const [rows] = await pool.execute<VolRow[]>(
    `SELECT
       COALESCE(SUM(CASE
         WHEN t.\`type\` = 'PAYIN' AND UPPER(TRIM(t.\`status\`)) IN ${AGENT_SETTLED_LEDGER_SQL_IN}
         THEN CAST(t.\`amount\` AS DECIMAL(18,2)) ELSE 0 END), 0) AS pay_in_volume,
       COALESCE(SUM(CASE
         WHEN t.\`type\` = 'PAYOUT'
          AND UPPER(TRIM(t.\`status\`)) IN ${AGENT_SETTLED_LEDGER_SQL_IN}
         THEN CAST(t.\`amount\` AS DECIMAL(18,2)) ELSE 0 END), 0) AS pay_out_volume
     FROM \`transactions\` t
     WHERE t.\`company_id\` = ? AND (${period.sql})`,
    [companyId, ...period.params],
  );
  const r = rows[0];
  return { payIn: num(r?.pay_in_volume), payOut: num(r?.pay_out_volume) };
}

/** Signed settlement: CREDIT positive, DEBIT negative (manual amount is always entered positive). */
export function signedSettlementFromManual(
  amount: number,
  transactionType: SettlementTxnType,
): number {
  const abs = Math.abs(amount);
  if (!Number.isFinite(abs) || abs <= 0) return 0;
  const rounded = Math.round(abs * 100) / 100;
  return transactionType === "CREDIT" ? rounded : -rounded;
}

type DbExec = Pick<PoolConnection, "execute">;

/**
 * Apply settled amount to agent balances. Updates settlement_amount + running_balance.
 * Does NOT modify previous_balance — that is only set by the midnight cron (yesterday's running).
 */
export async function applyAgentSettlementBalances(
  exec: DbExec,
  agentId: number,
  signedAmount: number,
): Promise<void> {
  const signed = Math.round(signedAmount * 100) / 100;
  const absSettled = Math.abs(signed);
  if (absSettled <= 0) return;

  const [result] = await exec.execute<ResultSetHeader>(
    `UPDATE \`agents\`
     SET \`settlement_amount\` = \`settlement_amount\` + ?,
         \`running_balance\` = \`running_balance\` - ?,
         \`settlement_date\` = UNIX_TIMESTAMP()
     WHERE \`id\` = ?`,
    [absSettled, signed, agentId],
  );
  if (result.affectedRows !== 1) {
    throw new Error("AGENT_SETTLEMENT_BALANCE_UPDATE_FAILED");
  }
}

/**
 * Company settlement: updates settlement totals only (no commission % on companies row).
 */
export async function applyCompanySettlementBalances(
  exec: DbExec,
  companyId: number,
  signedAmount: number,
): Promise<void> {
  const signed = Math.round(signedAmount * 100) / 100;
  const absSettled = Math.abs(signed);
  if (absSettled <= 0) return;

  const [result] = await exec.execute<ResultSetHeader>(
    `UPDATE \`companies\`
     SET \`settlement_amount\` = \`settlement_amount\` + ?,
         \`settlement_date\` = NOW()
     WHERE \`id\` = ?`,
    [absSettled, companyId],
  );
  if (result.affectedRows !== 1) {
    throw new Error("COMPANY_SETTLEMENT_BALANCE_UPDATE_FAILED");
  }
}

export function computeFinalSettlementAmount(opts: {
  payInVolume: number;
  payOutVolume: number;
  payInCommissionAmt: number;
  payOutCommissionAmt: number;
  referralCommissionAmt: number;
  settlementType: SettlementType;
  commissionHead: CommissionHead;
  transactionType: SettlementTxnType;
  runningBalance: number;
  previousBalance: number;
  manualAmount?: number;
}): number {
  if (opts.manualAmount != null && Number.isFinite(opts.manualAmount)) {
    return signedSettlementFromManual(opts.manualAmount, opts.transactionType);
  }

  let payInC = opts.payInCommissionAmt;
  let payOutC = opts.payOutCommissionAmt;
  let refC = opts.referralCommissionAmt;
  if (opts.commissionHead === "PAYIN") {
    payOutC = 0;
    refC = 0;
  } else if (opts.commissionHead === "PAYOUT") {
    payInC = 0;
    refC = 0;
  } else if (opts.commissionHead === "REFERRAL") {
    payInC = 0;
    payOutC = 0;
  }

  const commissions = payInC + payOutC + refC;
  const netVol = opts.payInVolume - opts.payOutVolume;

  let base = 0;
  if (opts.settlementType === "FULL") {
    base = opts.runningBalance;
  } else if (opts.settlementType === "PARTIAL") {
    base = netVol;
  } else {
    base = netVol - commissions;
  }

  const signed = opts.transactionType === "CREDIT" ? Math.abs(base) : -Math.abs(base);
  return Math.round(signed * 100) / 100;
}

export async function buildSettlementPreview(
  pool: Pool,
  partyType: SettlementPartyType,
  partyId: number,
  periodFrom: Date | null,
  periodTo: Date | null,
): Promise<SettlementPreview | null> {
  if (partyType === "AGENT") {
    const [rows] = await pool.execute<AgentRow[]>(
      `SELECT \`id\`, \`fullname\`, \`username\`, \`previous_balance\`, \`running_balance\`,
              \`net_pay_in\`, \`net_pay_out\`, \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`
       FROM \`agents\` WHERE \`id\` = ? LIMIT 1`,
      [partyId],
    );
    const a = rows[0];
    if (!a) return null;
    const vol = await volumeForAgent(pool, partyId, periodFrom, periodTo);
    const payInPct = num(a.pay_in_commission);
    const payOutPct = num(a.pay_out_commission);
    const refPct = num(a.referral_commission);
    const payInCAmt = pctAmount(vol.payIn, payInPct);
    const payOutCAmt = pctAmount(vol.payOut, payOutPct);
    const refCAmt = pctAmount(vol.payIn, refPct);
    const prev = num(a.previous_balance);
    const run = num(a.running_balance) || prev + num(a.net_pay_in) - num(a.net_pay_out);

    return {
      partyType: "AGENT",
      partyId,
      partyName: (a.fullname && a.fullname.trim()) || a.username,
      periodFrom: periodFrom?.toISOString() ?? null,
      periodTo: periodTo?.toISOString() ?? null,
      payInVolume: vol.payIn,
      payOutVolume: vol.payOut,
      payInCommissionPct: payInPct,
      payOutCommissionPct: payOutPct,
      referralCommissionPct: refPct,
      payInCommissionAmount: payInCAmt,
      payOutCommissionAmount: payOutCAmt,
      referralCommissionAmount: refCAmt,
      previousBalanceSnapshot: prev,
      runningBalanceSnapshot: run,
      netVolume: vol.payIn - vol.payOut,
      suggestedFinalAmount: computeFinalSettlementAmount({
        payInVolume: vol.payIn,
        payOutVolume: vol.payOut,
        payInCommissionAmt: payInCAmt,
        payOutCommissionAmt: payOutCAmt,
        referralCommissionAmt: refCAmt,
        settlementType: "NET",
        commissionHead: "ALL",
        transactionType: "DEBIT",
        runningBalance: run,
        previousBalance: prev,
      }),
    };
  }

  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`net_pay_in\`, \`net_pay_out\`, \`commission\`
     FROM \`companies\` WHERE \`id\` = ? LIMIT 1`,
    [partyId],
  );
  const c = rows[0];
  if (!c) return null;
  const vol = await volumeForCompany(pool, partyId, periodFrom, periodTo);
  const commPct = num(c.commission);
  const payInCAmt = pctAmount(vol.payIn, commPct);
  const payOutCAmt = pctAmount(vol.payOut, commPct);
  const prev = 0;
  const run = num(c.net_pay_in) - num(c.net_pay_out);

  return {
    partyType: "COMPANY",
    partyId,
    partyName: (c.brand_name && c.brand_name.trim()) || c.username,
    periodFrom: periodFrom?.toISOString() ?? null,
    periodTo: periodTo?.toISOString() ?? null,
    payInVolume: vol.payIn,
    payOutVolume: vol.payOut,
    payInCommissionPct: commPct,
    payOutCommissionPct: commPct,
    referralCommissionPct: 0,
    payInCommissionAmount: payInCAmt,
    payOutCommissionAmount: payOutCAmt,
    referralCommissionAmount: 0,
    previousBalanceSnapshot: prev,
    runningBalanceSnapshot: run,
    netVolume: vol.payIn - vol.payOut,
    suggestedFinalAmount: computeFinalSettlementAmount({
      payInVolume: vol.payIn,
      payOutVolume: vol.payOut,
      payInCommissionAmt: payInCAmt,
      payOutCommissionAmt: payOutCAmt,
      referralCommissionAmt: 0,
      settlementType: "NET",
      commissionHead: "ALL",
      transactionType: "DEBIT",
      runningBalance: run,
      previousBalance: prev,
    }),
  };
}

export function parseOptionalDate(v: string | null | undefined): Date | null {
  if (!v || !String(v).trim()) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}
