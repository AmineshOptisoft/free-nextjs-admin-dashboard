"use client";
import React, { useEffect, useMemo, useState } from "react";
import DateRangePicker, { DateRange } from "../dashboard/DateRangePicker";
import Pagination from "../ui/Pagination";
import { IoIosWarning } from "react-icons/io";


const PAGE_SIZE = 5;

type DisputeStatus  = "PENDING" | "RESOLVED" | "EXPIRED";
type PaymentStatus  = "PAYIN_APPROVED" | "PAYIN_PENDING" | "PAYOUT_APPROVED" | "PAYOUT_PENDING" | "FAILED";
type DisputeReason  = string;

interface DisputeItem {
  id: string;
  ref: string;
  amount: number;
  disputeStatus: DisputeStatus;
  paymentStatus: PaymentStatus;
  orderId: string;
  companyName: string;
  subAdminName: string;
  clientName: string;
  clientUpi: string;
  utrCode: string;
  assignedUpi: string;
  reason: DisputeReason;
  createdOn: string;
}

const mockData: DisputeItem[] = [
  { id: "1",  ref: "#G690HL0X9N4", amount: 2500,  disputeStatus: "RESOLVED", paymentStatus: "PAYIN_APPROVED",  orderId: "GF1gKHbvHQ8X88W",   companyName: "Leo", subAdminName: "Jatinvp112",  clientName: "BT247_Shrikant99", clientUpi: "SKIP_UPI", utrCode: "950517965557",  assignedUpi: "gpay-11552523466@okbizaxis",  reason: "Pp",           createdOn: "Fri 08 May 2026, 14:00" },
  { id: "2",  ref: "#H1070SA5K9",  amount: 500,   disputeStatus: "RESOLVED", paymentStatus: "PAYIN_APPROVED",  orderId: "MVT7F3Ol4Aye2AH",   companyName: "Leo", subAdminName: "Kanhal33",    clientName: "0510411",          clientUpi: "SKIP_UPI", utrCode: "088703338360",  assignedUpi: "9660830603@okbizaxis",       reason: "Received",     createdOn: "Fri 08 May 2026, 13:55" },
  { id: "3",  ref: "#KP23MN7XQZ",  amount: 1200,  disputeStatus: "PENDING",  paymentStatus: "PAYIN_PENDING",   orderId: "KP23MN7XQZrBCD9",   companyName: "Leo", subAdminName: "RajeshAdmin",  clientName: "BT247_Ramesh44",   clientUpi: "SKIP_UPI", utrCode: "112233445566",  assignedUpi: "7894561230@axisbank",        reason: "Wrong Amount", createdOn: "Fri 08 May 2026, 13:50" },
  { id: "4",  ref: "#LQ34NO8YRA",  amount: 3000,  disputeStatus: "PENDING",  paymentStatus: "PAYIN_PENDING",   orderId: "LQ34NO8YRAsCDE0",   companyName: "Leo", subAdminName: "SureshVP",    clientName: "PLYBG_Suresh77",   clientUpi: "SKIP_UPI", utrCode: "223344556677",  assignedUpi: "8905672341@hdfcbank",        reason: "Not Credited", createdOn: "Fri 08 May 2026, 13:45" },
  { id: "5",  ref: "#MR45OP9ZSB",  amount: 750,   disputeStatus: "PENDING",  paymentStatus: "PAYOUT_PENDING",  orderId: "MR45OP9ZSBtDEF1",   companyName: "Leo", subAdminName: "ArunMgr",     clientName: "BT247_Arun22",     clientUpi: "SKIP_UPI", utrCode: "334455667788",  assignedUpi: "9016783452@sbi",             reason: "Duplicate",    createdOn: "Fri 08 May 2026, 13:40" },
  { id: "6",  ref: "#NS56PQ0ATC",  amount: 5500,  disputeStatus: "RESOLVED", paymentStatus: "PAYOUT_APPROVED", orderId: "NS56PQ0ATCuEFG2",   companyName: "Leo", subAdminName: "VijayOps",    clientName: "PLYBG_Vijay55",    clientUpi: "SKIP_UPI", utrCode: "445566778899",  assignedUpi: "gpay-9127654321@okbizaxis",  reason: "Pp",           createdOn: "Fri 08 May 2026, 13:35" },
  { id: "7",  ref: "#OT67QR1BUD",  amount: 8000,  disputeStatus: "RESOLVED", paymentStatus: "PAYIN_APPROVED",  orderId: "OT67QR1BUDvFGH3",   companyName: "Leo", subAdminName: "NeelamSr",    clientName: "BT247_Neela33",    clientUpi: "SKIP_UPI", utrCode: "556677889900",  assignedUpi: "9238765432@icicibank",       reason: "Received",     createdOn: "Fri 08 May 2026, 13:30" },
  { id: "8",  ref: "#PU78RS2CVE",  amount: 2200,  disputeStatus: "EXPIRED",  paymentStatus: "FAILED",          orderId: "PU78RS2CVEwGHI4",   companyName: "Leo", subAdminName: "PranavIT",    clientName: "PLYBG_Pranav88",   clientUpi: "SKIP_UPI", utrCode: "667788990011",  assignedUpi: "9349876543@kotakbank",       reason: "Other",        createdOn: "Fri 08 May 2026, 12:00" },
  { id: "9",  ref: "#QV89ST3DWF",  amount: 1800,  disputeStatus: "EXPIRED",  paymentStatus: "FAILED",          orderId: "QV89ST3DWFxHIJ5",   companyName: "Leo", subAdminName: "ManojHead",   clientName: "BT247_Manoj66",    clientUpi: "SKIP_UPI", utrCode: "778899001122",  assignedUpi: "9450987654@yesbank",         reason: "Wrong Amount", createdOn: "Fri 08 May 2026, 11:30" },
  { id: "10", ref: "#RW90TU4EXG",  amount: 4200,  disputeStatus: "PENDING",  paymentStatus: "PAYIN_PENDING",   orderId: "RW90TU4EXGyIJK6",   companyName: "Leo", subAdminName: "DivyaCFO",    clientName: "PLYBG_Divya11",    clientUpi: "SKIP_UPI", utrCode: "889900112233",  assignedUpi: "9561098765@axisbank",        reason: "Not Credited", createdOn: "Fri 08 May 2026, 11:00" },
];

const USE_DEMO_DATA = false;

const STATUS_TABS: { label: string; value: DisputeStatus | "ALL" }[] = [
  { label: "All",      value: "ALL" },
  { label: "Pending",  value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Expired",  value: "EXPIRED" },
];

const STATUS_FILTER_OPTIONS = ["All", "PENDING", "RESOLVED", "EXPIRED"];

const disputeStatusStyle: Record<DisputeStatus, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500",
  EXPIRED:  "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusStyle: Record<PaymentStatus, string> = {
  PAYIN_APPROVED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  PAYIN_PENDING:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  PAYOUT_APPROVED: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  PAYOUT_PENDING:  "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  FAILED:          "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PAYIN_APPROVED:  "PAYIN APPROVED",
  PAYIN_PENDING:   "PAYIN PENDING",
  PAYOUT_APPROVED: "PAYOUT APPROVED",
  PAYOUT_PENDING:  "PAYOUT PENDING",
  FAILED:          "FAILED",
};

const disputeStatusLabel: Record<DisputeStatus, string> = {
  PENDING:  "DISPUTE PENDING",
  RESOLVED: "DISPUTE RESOLVED",
  EXPIRED:  "DISPUTE EXPIRED",
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{value}</p>
    </div>
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

function DisputeCard({ item }: { item: DisputeItem }) {
  const [extraOpen, setExtraOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const canResolve = item.disputeStatus === "PENDING";

  const detailsContent = (
    <>
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 mb-4">
        <DetailField label="Order ID"      value={item.orderId} />
        <DetailField label="Company Name"  value={item.companyName} />
        <DetailField label="SubAdmin Name" value={item.subAdminName} />
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 mb-4">
        <DetailField label="Client Name" value={item.clientName} />
        <DetailField label="Client UPI"  value={item.clientUpi} />
        <DetailField label="UTR Code"    value={item.utrCode} />
      </div>
      {/* Row 3 — Assigned UPI full width */}
      <div className="mb-0">
        <DetailField label="Assigned UPI" value={item.assignedUpi} />
      </div>
    </>
  );

  const footerRow = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-700 dark:text-gray-300">Dispute Reason: </span>
        {item.reason}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Media
        </button>
        <button className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Chats
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${
            canResolve
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
          disabled={!canResolve}
        >
          Resolve Dispute
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.ref}</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            {item.amount.toLocaleString("en-IN")} INR
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${disputeStatusStyle[item.disputeStatus]}`}>
            {disputeStatusLabel[item.disputeStatus]}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${paymentStatusStyle[item.paymentStatus]}`}>
            {paymentStatusLabel[item.paymentStatus]}
          </span>
        </div>
        {/* Mobile chevron */}
        <span className="lg:hidden">
          <ChevronBtn rotated={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
        </span>
        {/* Desktop chevron — toggles extra/created-on info */}
        <span className="hidden lg:inline-flex">
          <ChevronBtn rotated={extraOpen} onClick={() => setExtraOpen((v) => !v)} />
        </span>
      </div>

      {/* ── DESKTOP: always-visible details ── */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800 px-5 py-4">
        {detailsContent}
        {footerRow}
        {/* Extra toggled info */}
        {extraOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailField label="Created On" value={item.createdOn} />
          </div>
        )}
      </div>

      {/* ── MOBILE: accordion ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-4">
          {detailsContent}
          {footerRow}
        </div>
      )}
    </div>
  );
}

export default function DisputeList() {
  const [items, setItems] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<DisputeStatus | "ALL">("ALL");
  const [showFilter, setShowFilter]     = useState(false);
  const [search, setSearch]             = useState("");
  const [amount, setAmount]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateRange, setDateRange]       = useState<DateRange | null>(null);

  // Pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/admin/disputes?limit=500", { credentials: "include" });
        const data = (await res.json()) as { ok?: boolean; items?: DisputeItem[]; error?: string };
        if (!mounted) return;
        if (!res.ok || !data.ok || !data.items) {
          setLoadError(data.error ?? "Could not load disputes.");
          setItems(USE_DEMO_DATA ? mockData : []);
          return;
        }
        setItems(data.items);
      } catch {
        if (!mounted) return;
        setLoadError("Network error.");
        setItems(USE_DEMO_DATA ? mockData : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const baseData = useMemo(() => (items.length ? items : USE_DEMO_DATA ? mockData : []), [items]);
  const totalOrders = baseData.length;

  const counts: Partial<Record<DisputeStatus | "ALL", number>> = {
    ALL:      baseData.length,
    PENDING:  baseData.filter((d) => d.disputeStatus === "PENDING").length,
    RESOLVED: baseData.filter((d) => d.disputeStatus === "RESOLVED").length,
    EXPIRED:  baseData.filter((d) => d.disputeStatus === "EXPIRED").length,
  };

  const filtered = baseData.filter((d) => {
    if (activeTab !== "ALL" && d.disputeStatus !== activeTab) return false;
    if (search &&
      !d.orderId.toLowerCase().includes(search.toLowerCase()) &&
      !d.clientName.toLowerCase().includes(search.toLowerCase()) &&
      !d.utrCode.includes(search) &&
      !d.assignedUpi.toLowerCase().includes(search.toLowerCase()) &&
      !d.subAdminName.toLowerCase().includes(search.toLowerCase())) return false;
    if (amount && d.amount !== Number(amount)) return false;
    if (filterStatus !== "All" && d.disputeStatus !== filterStatus) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <IoIosWarning className="w-6 h-6" />
        <h1 className="text-xl font-bold ">Disputes</h1>
      </div>

      {/* Advanced Search panel */}
      {showFilter && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {/* Header */}
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
                  {totalOrders.toLocaleString()} Disputes found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button onClick={() => setShowFilter(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search & Filter */}
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
                  placeholder="Search by client, UTR, order ID..."
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
              Client Name, Order ID, UTR Code, SubAdmin Name, Assigned UPI
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
            const count = counts[tab.value as DisputeStatus];
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
        {loading ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-6 py-12 text-center text-gray-400">
            Loading disputes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-6 py-12 text-center text-gray-400">
            No disputes found.
          </div>
        ) : (
          paginated.map((item) => <DisputeCard key={item.id} item={item} />)
        )}
      </div>
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          {loadError}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
