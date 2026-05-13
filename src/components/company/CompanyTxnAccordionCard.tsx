"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

function MoneyBillIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}

function shortOrderRef(orderId: string): string {
  const base = orderId.replace(/^#/, "").trim();
  if (!base) return "#—";
  return `#${base.slice(0, 10)}`;
}

function formatInr(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-IN")} INR`;
}

function formatCompanyTxnDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = get("hour").padStart(2, "0");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toLowerCase();
  const timePart = dayPeriod ? `${hour}:${minute} ${dayPeriod}` : `${hour}:${minute}`;
  return `${get("weekday")}, ${get("day")} ${get("month")}, ${get("year")}, ${timePart}`;
}

function displayDash(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  return t.length ? t : "—";
}

function displayClientUpi(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  return t.length ? t : "NONE";
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "APPROVED" || s === "PAID" || s === "APPROVED_BY_ADMIN" || s === "APPROVED_BY_AGENT") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300";
  }
  if (s === "PENDING" || s === "RE_ASSIGNED" || s === "PROCESSING") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-blue-300";
  }
  if (s === "REJECTED" || s === "DECLINED" || s === "REVOKED" || s === "EXPIRED") {
    return "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-300";
  }
  if (s === "NOT_ASSIGNED" || s === "UNASSIGNED" || s === "CREATED") {
    return "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function GridField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="break-all text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export type CompanyTxnAccordionCardProps = {
  variant: "PAYIN" | "PAYOUT";
  transactionId: string;
  orderId: string;
  amount: number;
  status: string;
  clientName: string;
  clientUpi: string;
  /** Payout: optional bank line for the third column (label becomes BANK). */
  bankSummary?: string;
  utrCode: string;
  assignedUpi: string;
  createdAtIso?: string;
  assignedAtIso?: string;
  assignedToLabel: string;
  remarks: string;
  discountAmount?: number;
  footer?: ReactNode;
  defaultOpen?: boolean;
};

export default function CompanyTxnAccordionCard({
  variant,
  transactionId,
  orderId,
  amount,
  status,
  clientName,
  clientUpi,
  bankSummary,
  utrCode,
  assignedUpi,
  createdAtIso,
  assignedAtIso,
  assignedToLabel,
  remarks,
  discountAmount = 0,
  footer,
  defaultOpen = true,
}: CompanyTxnAccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const thirdLabel = variant === "PAYOUT" && bankSummary?.trim() ? "BANK" : "CLIENT UPI";
  const thirdValue = variant === "PAYOUT" && bankSummary?.trim() ? bankSummary.trim() : displayClientUpi(clientUpi);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="whitespace-nowrap font-mono text-xs font-medium text-gray-600 dark:text-gray-300">
            {shortOrderRef(orderId)}
          </span>
          <MoneyBillIcon />
          <span className="whitespace-nowrap text-lg font-bold text-gray-900 dark:text-white">{formatInr(amount)}</span>
          <span
            className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusBadgeClass(status)}`}
          >
            {status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/company-dashboard/trx/${transactionId}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            aria-expanded={open}
            aria-label={open ? "Collapse details" : "Expand details"}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-6">
            <GridField label="ORDER ID" value={displayDash(orderId)} />
            <GridField label="CLIENT NAME" value={displayDash(clientName)} />
            <GridField label={thirdLabel} value={thirdValue} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-6">
            <GridField label="UTR CODE" value={displayDash(utrCode)} />
            <GridField label="ASSIGNED UPI" value={displayDash(assignedUpi)} />
            <GridField label="CREATED ON" value={formatCompanyTxnDate(createdAtIso)} />
          </div>

          <div className="my-4 border-t border-gray-100 dark:border-gray-800" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-6">
            <GridField label="TOTAL AMOUNT" value={formatInr(amount)} />
            <GridField label="DISCOUNT AMOUNT" value={formatInr(discountAmount)} />
            <GridField label="ASSIGNED TO" value={displayDash(assignedToLabel)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-6">
            <GridField label="ASSIGNED ON" value={formatCompanyTxnDate(assignedAtIso)} />
            <GridField label="REMARKS" value={displayDash(remarks)} />
          </div>
          {footer ? <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">{footer}</div> : null}
        </div>
      )}
    </div>
  );
}
