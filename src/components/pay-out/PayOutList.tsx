"use client";
import React, { useCallback, useEffect, useState } from "react";
import type { AgentPayOutListItem } from "@/lib/agent-transactions-map";
import CompanyTxnAccordionCard from "../company/CompanyTxnAccordionCard";
import DateRangePicker, { DateRange } from "../dashboard/DateRangePicker";
import Pagination from "../ui/Pagination";
import { Modal } from "../ui/modal";
import { PiContactlessPaymentFill } from "react-icons/pi";

const PAGE_SIZE = 5;
const USE_DEMO_DATA = false;

type PayOutStatus = "CREATED" | "UNASSIGNED" | "PENDING" | "PROCESSING" | "EXPIRED" | "APPROVED" | "DECLINED";

type PayOutItem = AgentPayOutListItem;
type CompanyPayoutItem = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  clientName: string;
  clientUpi: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  createdAtIso?: string;
  remarks?: string;
  utrCode?: string;
  assignedUpi?: string;
  assignedAtIso?: string;
  assignedToLabel?: string;
};
type AgentOption = { id: string; label: string };

const mockData: PayOutItem[] = [
  { id: "1",  ref: "#dn56McMZ",  amount: 3800,  status: "CREATED",     orderId: "dn56McMZqBODA6P",  clientName: "BT247_prudhvi814",   clientUpi: "Dasivindhya",   bankName: "TelanaganaGrameenaBank", accountNo: "79104505384",  ifsc: "TGRB0008168", createdOn: "Fri 08 May 2026, 16:00" },
  { id: "2",  ref: "#1AJyl9tE",  amount: 11600, status: "CREATED",     orderId: "1AJyl9tEr2df2jO",  clientName: "BT247_Bmveeresh93",  clientUpi: "B.MVeeresh",    bankName: "StateBankofIndia",       accountNo: "34309590598",  ifsc: "SBIN0040118", createdOn: "Fri 08 May 2026, 16:00" },
  { id: "3",  ref: "#ILtAtSdl",  amount: 2648,  status: "CREATED",     orderId: "ILtAtSdliwXQiWP",  clientName: "BT247_Manju190",     clientUpi: "ManjunathaP",   bankName: "CanaraBank",             accountNo: "0450101034358", ifsc: "CNRB0000450", createdOn: "Fri 08 May 2026, 16:01" },
  { id: "4",  ref: "#PR7KmX9T",  amount: 5000,  status: "UNASSIGNED",  orderId: "PR7KmX9TwBNE3sR",  clientName: "PLYBG_Sharma99",     clientUpi: "SharmaUPI",     bankName: "HDFCBank",               accountNo: "50100421783",  ifsc: "HDFC0001234", createdOn: "Fri 08 May 2026, 15:55" },
  { id: "5",  ref: "#MQ2NvPzA",  amount: 8200,  status: "UNASSIGNED",  orderId: "MQ2NvPzAkFGH7tL",  clientName: "BT247_Reddy77",      clientUpi: "ReddyUPI",      bankName: "ICICIBank",              accountNo: "628405063791", ifsc: "ICIC0003456", createdOn: "Fri 08 May 2026, 15:50" },
  { id: "6",  ref: "#XB9CwLjF",  amount: 1500,  status: "UNASSIGNED",  orderId: "XB9CwLjFoPQR5mK",  clientName: "PLYBG_Nair44",       clientUpi: "NairUPI",       bankName: "AxisBank",               accountNo: "917020045612", ifsc: "UTIB0001789", createdOn: "Fri 08 May 2026, 15:48" },
  { id: "7",  ref: "#YZ4DsHqR",  amount: 3200,  status: "UNASSIGNED",  orderId: "YZ4DsHqRuVWX8nM",  clientName: "BT247_Kumar55",      clientUpi: "KumarUPI",      bankName: "KotakBank",              accountNo: "1234567890",   ifsc: "KKBK0007812", createdOn: "Fri 08 May 2026, 15:45" },
  { id: "8",  ref: "#GH5EtIkS",  amount: 6750,  status: "UNASSIGNED",  orderId: "GH5EtIkSvYZA9oN",  clientName: "PLYBG_Gupta21",      clientUpi: "GuptaUPI",      bankName: "PNBBank",                accountNo: "0634000112345",ifsc: "PUNB0063400", createdOn: "Fri 08 May 2026, 15:42" },
  { id: "9",  ref: "#TU6FuJlT",  amount: 4100,  status: "UNASSIGNED",  orderId: "TU6FuJlTwABC0pO",  clientName: "BT247_Verma33",      clientUpi: "VermaUPI",      bankName: "UnionBank",              accountNo: "5105001234567",ifsc: "UBIN0556789", createdOn: "Fri 08 May 2026, 15:40" },
  { id: "10", ref: "#VW7GvKmU",  amount: 2300,  status: "UNASSIGNED",  orderId: "VW7GvKmUxBCD1qP",  clientName: "PLYBG_Singh66",      clientUpi: "SinghUPI",      bankName: "BankofBaroda",           accountNo: "19550100023456",ifsc: "BARB0PANVET", createdOn: "Fri 08 May 2026, 15:38" },
  { id: "11", ref: "#WX8HwLnV",  amount: 9500,  status: "UNASSIGNED",  orderId: "WX8HwLnVyCDE2rQ",  clientName: "BT247_Joshi88",      clientUpi: "JoshiUPI",      bankName: "YesBank",                accountNo: "001893300002390",ifsc: "YESB0000189", createdOn: "Fri 08 May 2026, 15:35" },
  { id: "12", ref: "#XY9IxMoW",  amount: 1800,  status: "UNASSIGNED",  orderId: "XY9IxMoWzDEF3sR",  clientName: "PLYBG_Mehta12",      clientUpi: "MehtaUPI",      bankName: "IndusIndBank",           accountNo: "201001234567", ifsc: "INDB0000190", createdOn: "Fri 08 May 2026, 15:32" },
  { id: "13", ref: "#YZ0JyNpX",  amount: 7200,  status: "UNASSIGNED",  orderId: "YZ0JyNpXaEFG4tS",  clientName: "BT247_Rao44",        clientUpi: "RaoUPI",        bankName: "FederalBank",            accountNo: "14790200001234",ifsc: "FDRL0001479", createdOn: "Fri 08 May 2026, 15:30" },
  { id: "14", ref: "#AB1KzOqY",  amount: 3600,  status: "PENDING",     orderId: "AB1KzOqYbFGH5uT",  clientName: "PLYBG_Patel55",      clientUpi: "PatelUPI",      bankName: "BankofIndia",            accountNo: "421010110006789",ifsc: "BKID0004210", createdOn: "Fri 08 May 2026, 15:28", assignedTo: "Vendor A", assignedOn: "Fri 08 May 2026, 15:29" },
  { id: "15", ref: "#BC2LaPoZ",  amount: 14500, status: "PENDING",     orderId: "BC2LaPo_ZcGHI6vU", clientName: "BT247_Naik77",       clientUpi: "NaikUPI",       bankName: "CentralBank",            accountNo: "3456789012",   ifsc: "CBIN0283456", createdOn: "Fri 08 May 2026, 15:25", assignedTo: "Vendor B", assignedOn: "Fri 08 May 2026, 15:26" },
  { id: "16", ref: "#CD3MbQrA",  amount: 4400,  status: "PROCESSING",  orderId: "CD3MbQrAdHIJ7wV",  clientName: "PLYBG_Shetty99",     clientUpi: "ShettyUPI",     bankName: "UCOBank",                accountNo: "01590101000123",ifsc: "UCBA0000159", createdOn: "Fri 08 May 2026, 15:20", assignedTo: "Vendor C", assignedOn: "Fri 08 May 2026, 15:21" },
  { id: "17", ref: "#DE4NcRsB",  amount: 6100,  status: "PROCESSING",  orderId: "DE4NcRsBe_IJK8xW", clientName: "BT247_Pillai22",     clientUpi: "PillaiUPI",     bankName: "IOBBank",                accountNo: "089301000009876",ifsc: "IOBA0000893", createdOn: "Fri 08 May 2026, 15:18", assignedTo: "Vendor D", assignedOn: "Fri 08 May 2026, 15:19" },
  { id: "18", ref: "#EF5OdStC",  amount: 2900,  status: "EXPIRED",     orderId: "EF5OdStCfJKL9yX",  clientName: "PLYBG_Iyer11",       clientUpi: "IyerUPI",       bankName: "BankofMaharashtra",      accountNo: "60078365783",  ifsc: "MAHB0001000", createdOn: "Fri 08 May 2026, 14:00", remarks: "Expired — timeout" },
  { id: "19", ref: "#FG6PeTuD",  amount: 7800,  status: "APPROVED",    orderId: "FG6PeTuDgKLM0zA",  clientName: "BT247_Desai33",      clientUpi: "DesaiUPI",      bankName: "SBIBank",                accountNo: "32145678901",  ifsc: "SBIN0012345", createdOn: "Fri 08 May 2026, 13:30", assignedTo: "Vendor E", assignedOn: "Fri 08 May 2026, 13:31" },
  { id: "20", ref: "#GH7QfUvE",  amount: 3300,  status: "DECLINED",    orderId: "GH7QfUvEhLMN1aB",  clientName: "PLYBG_Yadav44",      clientUpi: "YadavUPI",      bankName: "HDFCBank",               accountNo: "50100987654",  ifsc: "HDFC0004567", createdOn: "Fri 08 May 2026, 13:00", remarks: "Declined — insufficient funds" },
];

const STATUS_TABS: { label: string; value: PayOutStatus | "ALL" }[] = [
  { label: "All",        value: "ALL" },
  { label: "Unassigned", value: "UNASSIGNED" },
  { label: "Pending",    value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Expired",    value: "EXPIRED" },
  { label: "Approved",   value: "APPROVED" },
  { label: "Declined",   value: "DECLINED" },
];

const STATUS_FILTER_OPTIONS = ["All", "CREATED", "UNASSIGNED", "PENDING", "PROCESSING", "EXPIRED", "APPROVED", "DECLINED"];

const statusStyle: Record<PayOutStatus, string> = {
  CREATED:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  UNASSIGNED: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  PENDING:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PROCESSING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EXPIRED:    "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
  APPROVED:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DECLINED:   "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const showAssign = (s: PayOutStatus) => s === "CREATED" || s === "UNASSIGNED" || s === "PENDING";
const showApprove = (s: PayOutStatus) => s === "PROCESSING";
const showReject = (s: PayOutStatus) => s === "PENDING" || s === "PROCESSING";
const showCancel = (s: PayOutStatus) => s === "PENDING" || s === "PROCESSING";
const showActions = (s: PayOutStatus) => showApprove(s) || showReject(s) || showCancel(s);

function MoneyIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="6" width="20" height="13" rx="2" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeWidth={1.5} d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="inline w-3.5 h-3.5 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function DetailField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      {isLink ? (
        <a href="#" className="text-sm font-medium text-blue-500 hover:underline break-all">
          {value}<ExternalLinkIcon />
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{value}</p>
      )}
    </div>
  );
}

function AssignButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-gray-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Assign
    </button>
  );
}

function ApproveButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-gray-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Approve
    </button>
  );
}

function RejectButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Reject
    </button>
  );
}

function CancelButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Cancel
    </button>
  );
}

function ViewButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
    >
      View
    </button>
  );
}

function ChevronBtn({ rotated, onClick }: { rotated: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
    >
      <svg className={`w-4 h-4 transition-transform duration-200 ${rotated ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function PayOutCard({
  item,
  busy,
  onOpenAction,
  onView,
  allowAssign,
}: {
  item: PayOutItem;
  busy?: boolean;
  onOpenAction: (item: PayOutItem, action: "approve" | "reject" | "cancel" | "assign") => void;
  onView?: () => void;
  allowAssign?: boolean;
}) {
  const [extraOpen, setExtraOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRow = (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.ref}</span>
        <MoneyIcon />
        <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
          {item.amount.toLocaleString("en-IN")} INR
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${statusStyle[item.status]}`}>
          {item.status}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {allowAssign && showAssign(item.status) && <AssignButton onClick={() => onOpenAction(item, "assign")} disabled={busy} />}
        {showApprove(item.status) && <ApproveButton onClick={() => onOpenAction(item, "approve")} disabled={busy} />}
        {onView && <ViewButton onClick={onView} />}
        {/* Mobile chevron */}
        <span className="lg:hidden">
          <ChevronBtn rotated={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
        </span>
        {/* Desktop chevron */}
        <span className="hidden lg:inline-flex">
          <ChevronBtn rotated={extraOpen} onClick={() => setExtraOpen((v) => !v)} />
        </span>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/3 overflow-hidden">
      {headerRow}

      {/* ── DESKTOP: always-visible detail rows ── */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800 px-5 py-4">
        {/* Row 1: ORDER ID · CLIENT NAME · CLIENT UPI */}
        <div className="grid grid-cols-3 gap-x-8 mb-4">
          <DetailField label="Order ID" value={item.orderId} />
          <DetailField label="Client Name" value={item.clientName} />
          <DetailField label="Client UPI" value={item.clientUpi} />
        </div>

        {/* Row 2: BANK NAME · ACCOUNT NO · IFSC + Assign button */}
        <div className="flex items-end gap-8">
          <div className="grid grid-cols-3 gap-x-8 flex-1">
            <DetailField label="Bank Name" value={item.bankName} />
            <DetailField label="Account No" value={item.accountNo} />
            <DetailField label="IFSC" value={item.ifsc} />
          </div>
          <div className="shrink-0" />
        </div>

        {/* Extra rows toggled by chevron */}
        {extraOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailField label="Created On" value={item.createdOn} />
            {item.assignedTo && <DetailField label="Assigned To" value={item.assignedTo} />}
            {item.assignedOn && <DetailField label="Assigned On" value={item.assignedOn} />}
            {item.remarks   && <DetailField label="Remarks"     value={item.remarks} />}
          </div>
        )}
      </div>

      {/* ── MOBILE: accordion ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-4 grid grid-cols-1 gap-4">
          <DetailField label="Order ID"   value={item.orderId} />
          <DetailField label="Client Name" value={item.clientName} />
          <DetailField label="Client UPI" value={item.clientUpi} />
          <DetailField label="Bank Name"  value={item.bankName} />
          <DetailField label="Account No" value={item.accountNo} />
          <DetailField label="IFSC"       value={item.ifsc} />
          <DetailField label="Created On" value={item.createdOn} />
          {item.assignedTo && <DetailField label="Assigned To" value={item.assignedTo} />}
          {item.assignedOn && <DetailField label="Assigned On" value={item.assignedOn} />}
          {item.remarks    && <DetailField label="Remarks"     value={item.remarks} />}
        </div>
      )}
    </div>
  );
}

type CompanyPayOutTab = "ALL" | "APPROVED" | "PENDING" | "UNASSIGNED" | "REJECTED";
type ActionType = "approve" | "reject" | "cancel" | "assign";

function CompanyPayOutRequestModal({
  isOpen,
  onClose,
  onSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const inputClass =
    "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/15";
  const [form, setForm] = useState({
    client_name: "",
    client_upi: "",
    amount: "",
    bank_name: "",
    bank_account_number: "",
    ifsc_code: "",
    user_note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchField(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function submitRequest() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/company/payouts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not submit payout request");
        return;
      }
      setForm({
        client_name: "",
        client_upi: "",
        amount: "",
        bank_name: "",
        bank_account_number: "",
        ifsc_code: "",
        user_note: "",
      });
      onClose();
      onSubmitted();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0 overflow-hidden" showCloseButton={false}>
      <div className="rounded-xl bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-xl font-semibold text-gray-900">New PayOut Form</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Client ID <span className="text-red-500">*</span></label>
              <input
                className={inputClass}
                placeholder="Enter client UPI"
                value={form.client_upi}
                onChange={(e) => patchField("client_upi", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Client Name <span className="text-red-500">*</span></label>
              <input
                className={inputClass}
                placeholder="Full name of the client"
                value={form.client_name}
                onChange={(e) => patchField("client_name", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Amount <span className="text-red-500">*</span></label>
            <input
              className={inputClass}
              placeholder="Enter amount (₹)"
              value={form.amount}
              onChange={(e) => patchField("amount", e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3.5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Holder Name <span className="text-red-500">*</span></label>
                <input
                  className={inputClass}
                  value={form.client_name}
                  onChange={(e) => patchField("client_name", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Bank Name <span className="text-red-500">*</span></label>
                <input
                  className={inputClass}
                  value={form.bank_name}
                  onChange={(e) => patchField("bank_name", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Account Number <span className="text-red-500">*</span></label>
                <input
                  className={inputClass}
                  value={form.bank_account_number}
                  onChange={(e) => patchField("bank_account_number", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">IFSC Code <span className="text-red-500">*</span></label>
                <input
                  className={inputClass}
                  value={form.ifsc_code}
                  onChange={(e) => patchField("ifsc_code", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Remarks</label>
            <input
              className={inputClass}
              placeholder="Optional note"
              value={form.user_note}
              onChange={(e) => patchField("user_note", e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitRequest()}
              className="rounded-md bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function maskAccountTail(accountNo: string): string {
  const t = accountNo.replace(/\s/g, "");
  if (!t) return "";
  return t.length <= 4 ? t : `····${t.slice(-4)}`;
}

function companyPayoutBankSummary(it: CompanyPayoutItem): string {
  const parts: string[] = [];
  const bank = (it.bankName ?? "").trim();
  if (bank) parts.push(bank);
  const tail = maskAccountTail(it.accountNo ?? "");
  if (tail) parts.push(tail);
  const ifsc = (it.ifsc ?? "").trim();
  if (ifsc) parts.push(ifsc);
  return parts.length ? parts.join(" · ") : "—";
}

function CompanyPayOutView() {
  const [activeTab, setActiveTab] = useState<CompanyPayOutTab>("ALL");
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [items, setItems] = useState<CompanyPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyTabs: { label: string; value: CompanyPayOutTab }[] = [
    { label: "All", value: "ALL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Pending", value: "PENDING" },
    { label: "Not_assigned", value: "UNASSIGNED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const loadCompanyPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = activeTab === "ALL" ? "" : `?status=${encodeURIComponent(activeTab)}`;
      const res = await fetch(`/api/company/payouts${query}`, { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; payouts?: CompanyPayoutItem[]; error?: string };
      if (!res.ok || !data.ok || !data.payouts) {
        setError(data.error ?? "Could not load payouts");
        setItems([]);
        return;
      }
      setItems(data.payouts);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadCompanyPayouts();
  }, [loadCompanyPayouts]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <PiContactlessPaymentFill className="w-6 h-6 rotate-180" />
          <h1 className="text-xl font-bold">PayOut Management</h1>
        </div>
        <button
          onClick={() => setIsRequestOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {companyTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4-2v-4L3 4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {loading && <div className="rounded-xl border border-gray-100 px-3 py-5 text-sm text-gray-500">Loading payouts...</div>}
          {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="flex h-[180px] items-start justify-center rounded-xl border border-gray-100 pt-10 text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
              No PAYOUT requests found yet.
            </div>
          )}
          {!loading &&
            !error &&
            items.map((it) => (
              <CompanyTxnAccordionCard
                key={it.id}
                variant="PAYOUT"
                transactionId={it.id}
                orderId={it.orderId}
                amount={it.amount}
                status={it.status}
                clientName={it.clientName}
                clientUpi={it.clientUpi}
                bankSummary={companyPayoutBankSummary(it)}
                utrCode={it.utrCode ?? ""}
                assignedUpi={it.assignedUpi ?? ""}
                createdAtIso={it.createdAtIso}
                assignedAtIso={it.assignedAtIso}
                assignedToLabel={it.assignedToLabel ?? "—"}
                remarks={it.remarks ?? ""}
              />
            ))}
        </div>
      </div>

      <CompanyPayOutRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSubmitted={() => void loadCompanyPayouts()}
      />
    </div>
  );
}

export default function PayOutList() {
  const [panelRole] = useState<"admin" | "agent" | "company">(() => {
    if (typeof window === "undefined") return "admin";
    const role = localStorage.getItem("tepay_role");
    return role === "agent" || role === "company" ? role : "admin";
  });

  const [items, setItems] = useState<PayOutItem[] | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PayOutItem | null>(null);
  const [modalAction, setModalAction] = useState<ActionType>("approve");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<"admin" | "agent" | "company">(panelRole);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; role?: "admin" | "agent" | "company" };
        if (!mounted || !data.ok || !data.role) return;
        setResolvedRole(data.role);
        localStorage.setItem("tepay_role", data.role);
      } catch {
        // keep fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadPayOuts = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const endpoint =
      resolvedRole === "admin"
        ? "/api/admin/transactions?type=PAYOUT&limit=500"
        : "/api/agent/transactions?type=PAYOUT&limit=500";
    try {
      const res = await fetch(endpoint, { credentials: "include" });
      if (res.status === 401) {
        setItems(null);
        return;
      }
      const data = (await res.json()) as { ok?: boolean; items?: PayOutItem[]; error?: string };
      if (!res.ok || !data.ok || !data.items) {
        setItems(null);
        setListError(data.error ?? "Could not load transactions.");
        return;
      }
      setItems(data.items);
    } catch {
      setItems(null);
      setListError("Network error.");
    } finally {
      setListLoading(false);
    }
  }, [resolvedRole]);

  useEffect(() => {
    if (resolvedRole === "company") return;
    void loadPayOuts();
  }, [resolvedRole, loadPayOuts]);

  useEffect(() => {
    if (resolvedRole !== "admin") return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/agents", { credentials: "include" });
        const data = (await res.json()) as {
          ok?: boolean;
          agents?: Array<{ id: string; fullname?: string | null; username: string }>;
        };
        if (!mounted || !res.ok || !data.ok || !data.agents) return;
        setAgents(
          data.agents.map((a) => ({
            id: a.id,
            label: (a.fullname && a.fullname.trim()) || a.username,
          })),
        );
      } catch {
        // keep empty agent list; assignment modal shows validation
      }
    })();
    return () => {
      mounted = false;
    };
  }, [resolvedRole]);

  const [activeTab, setActiveTab] = useState<PayOutStatus | "ALL">("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const [page, setPage] = useState(1);

  if (resolvedRole === "company") {
    return <CompanyPayOutView />;
  }

  const baseData = items ?? (USE_DEMO_DATA ? mockData : []);
  const totalOrders = baseData.length;

  const counts: Partial<Record<PayOutStatus | "ALL", number>> = {
    ALL: baseData.length,
    CREATED: baseData.filter((d) => d.status === "CREATED").length,
    UNASSIGNED: baseData.filter((d) => d.status === "UNASSIGNED").length,
    PENDING: baseData.filter((d) => d.status === "PENDING").length,
    PROCESSING: baseData.filter((d) => d.status === "PROCESSING").length,
    EXPIRED: baseData.filter((d) => d.status === "EXPIRED").length,
    APPROVED: baseData.filter((d) => d.status === "APPROVED").length,
    DECLINED: baseData.filter((d) => d.status === "DECLINED").length,
  };

  const filtered = baseData.filter((d) => {
    if (activeTab !== "ALL" && d.status !== activeTab) return false;
    if (search &&
      !d.orderId.toLowerCase().includes(search.toLowerCase()) &&
      !d.clientName.toLowerCase().includes(search.toLowerCase()) &&
      !d.clientUpi.toLowerCase().includes(search.toLowerCase()) &&
      !d.bankName.toLowerCase().includes(search.toLowerCase()) &&
      !d.accountNo.includes(search)) return false;
    if (amount && d.amount !== Number(amount)) return false;
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openActionModal(item: PayOutItem, action: ActionType) {
    setSelectedItem(item);
    setModalAction(action);
    setModalError(null);
    setSelectedAgentId("");
    setModalOpen(true);
  }

  async function runAction(item: PayOutItem, action: ActionType) {
    setActionBusyId(item.id);
    setModalError(null);
    try {
      if (action === "approve" && !showApprove(item.status)) {
        setModalError("Approve only after assignment/processing stage.");
        return;
      }
      let res: Response;
      if (action === "assign") {
        if (resolvedRole !== "admin") {
          setModalError("Only admin can assign payout.");
          return;
        }
        if (!selectedAgentId) {
          setModalError("Please select an agent.");
          return;
        }
        res = await fetch(`/api/admin/payouts/${item.id}/assign`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: Number(selectedAgentId) }),
        });
      } else {
        const status =
          action === "approve"
            ? resolvedRole === "admin"
              ? "APPROVED_BY_ADMIN"
              : "APPROVED_BY_AGENT"
            : action === "reject"
              ? "REJECTED"
              : resolvedRole === "admin"
                ? "RE_ASSIGNED"
                : "REVOKED";
        const endpoint =
          resolvedRole === "admin" ? `/api/admin/payouts/${item.id}/status` : `/api/agent/payouts/${item.id}/status`;
        res = await fetch(endpoint, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      }
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setModalError(data.error ?? "Could not update payout status");
        return;
      }
      setModalOpen(false);
      setSelectedItem(null);
      await loadPayOuts();
    } catch {
      setModalError("Network error");
    } finally {
      setActionBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <PiContactlessPaymentFill className="w-6 h-6 rotate-180" />
          <h1 className="text-xl font-bold">Pay Out</h1>
        </div>
        {items !== null && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            {resolvedRole === "admin"
              ? "Live: all PayOut requests for admin actions (max 500)."
              : "Live: payout transactions assigned to your agent account (max 500)."}
          </p>
        )}
      </div>

      {listLoading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {resolvedRole === "admin" ? "Loading admin payouts…" : "Checking agent session…"}
        </div>
      )}
      {listError && items === null && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          {listError}
        </div>
      )}

      {showFilter && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/3 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Advanced Search</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                  </svg>
                  {totalOrders.toLocaleString()} Orders found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search & Filter inputs */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Filter</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Search</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, UPI, order ID..."
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors appearance-none cursor-pointer">
                  {STATUS_FILTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Client Name, UPI, Order ID, Account No, Bank Name
            </p>
          </div>

          {/* Date Range */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date Range</span>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} fullWidth />
          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 pb-4">
            <button onClick={() => setShowFilter(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              Hide Filters
            </button>
          </div>
        </div>
      )}

      {/* Tab bar + filter toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab.value as PayOutStatus];
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} onClick={() => { setActiveTab(tab.value); setPage(1); }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
                {count !== undefined && count > 0 && !isActive && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button onClick={() => setShowFilter((v) => !v)}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
            showFilter
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/3 px-6 py-12 text-center text-gray-400">
            No transactions found.
          </div>
        ) : (
          paginated.map((item) => (
            <PayOutCard
              key={item.id}
              item={item}
              busy={actionBusyId === item.id}
              onOpenAction={openActionModal}
              onView={() => (window.location.href = `/transactions/${item.id}`)}
              allowAssign={resolvedRole === "admin"}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalError(null);
        }}
        className="max-w-xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="rounded-xl bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PayOut Action</h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              x
            </button>
          </div>
          <div className="space-y-4 px-5 py-4">
            {selectedItem && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedItem.orderId} · {selectedItem.clientName} · ₹{selectedItem.amount.toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current action: <span className="font-semibold uppercase">{modalAction}</span>
            </p>
            {modalAction === "assign" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Assign to agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {modalError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {modalError}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {modalAction === "assign" ? (
                <AssignButton
                  onClick={() => selectedItem && void runAction(selectedItem, "assign")}
                  disabled={!selectedItem || actionBusyId === selectedItem?.id}
                />
              ) : (
                <>
                  <ApproveButton
                    onClick={() => selectedItem && void runAction(selectedItem, "approve")}
                    disabled={!selectedItem || actionBusyId === selectedItem?.id}
                  />
                  <RejectButton
                    onClick={() => selectedItem && void runAction(selectedItem, "reject")}
                    disabled={!selectedItem || actionBusyId === selectedItem?.id}
                  />
                  <CancelButton
                    onClick={() => selectedItem && void runAction(selectedItem, "cancel")}
                    disabled={!selectedItem || actionBusyId === selectedItem?.id}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
