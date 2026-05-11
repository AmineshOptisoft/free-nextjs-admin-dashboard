"use client";
import React, { useState } from "react";
import DateRangePicker, { DateRange } from "../dashboard/DateRangePicker";
import Pagination from "../ui/Pagination";
import { PiContactlessPaymentFill } from "react-icons/pi";

const PAGE_SIZE = 5;

type PayInStatus = "PENDING" | "APPROVED" | "EXPIRED" | "RECEIPT_PENDING" | "UNASSIGNED" | "PROCESSING";

interface PayInItem {
  id: string;
  ref: string;
  amount: number;
  status: PayInStatus;
  orderId: string;
  clientName: string;
  clientUpi: string;
  assignedUpi: string;
  createdOn: string;
  totalAmount: number;
  discountAmount: number;
  assignedTo: string;
  assignedOn: string;
  remarks: string;
  hasReceipt?: boolean;
  utrCode?: string;
}

const mockData: PayInItem[] = [
  {
    id: "1", ref: "#Q5PGJIZBJD", amount: 1000, status: "PENDING",
    orderId: "XGi3lXpT0l91WVg", clientName: "BT247_Swamy63", clientUpi: "SKIP_UPI",
    assignedUpi: "OW11481M53@mairtel", createdOn: "Fri 08 May 2026, 16:00",
    totalAmount: 1000, discountAmount: 0, assignedTo: "Rahul airtel",
    assignedOn: "Fri 08 May 2026, 16:00", remarks: "No remarks",
  },
  {
    id: "2", ref: "#WG4Y10X39S", amount: 2000, status: "PENDING",
    orderId: "oWa1V8DOeRPYTpS", clientName: "PLYBG_Nikki33", clientUpi: "SKIP_UPI",
    assignedUpi: "34915717SP@mairtel", createdOn: "Fri 08 May 2026, 16:00",
    totalAmount: 2000, discountAmount: 0, assignedTo: "Priya airtel",
    assignedOn: "Fri 08 May 2026, 16:00", remarks: "No remarks",
  },
  {
    id: "3", ref: "#HN1B62910A", amount: 5000, status: "PENDING",
    orderId: "2bzAaiDbSz4xZzz", clientName: "BT247_Reddy55", clientUpi: "SKIP_UPI",
    assignedUpi: "9511388004@MairTel", createdOn: "Fri 08 May 2026, 16:00",
    totalAmount: 5000, discountAmount: 0, assignedTo: "Sunil mairtel",
    assignedOn: "Fri 08 May 2026, 16:01", remarks: "No remarks",
    hasReceipt: true, utrCode: "017075330557",
  },
  {
    id: "4", ref: "#1APBGMGZND", amount: 500, status: "PENDING",
    orderId: "XIRYBYVeoOkAOQq", clientName: "BT247_Basvaraj93", clientUpi: "SKIP_UPI",
    assignedUpi: "gpay-11552523466@okbizaxis", createdOn: "Fri 08 May 2026, 16:01",
    totalAmount: 500, discountAmount: 0, assignedTo: "Sunil gpay",
    assignedOn: "Fri 08 May 2026, 16:02", remarks: "No remarks",
  },
  {
    id: "5", ref: "#KR3M19PLWQ", amount: 3000, status: "APPROVED",
    orderId: "Mn7pQx2Ry8vTa1Z", clientName: "PLYBG_Kumar21", clientUpi: "SKIP_UPI",
    assignedUpi: "9876543210@ybl", createdOn: "Fri 08 May 2026, 15:45",
    totalAmount: 3000, discountAmount: 0, assignedTo: "Amit ybl",
    assignedOn: "Fri 08 May 2026, 15:46", remarks: "No remarks",
  },
  {
    id: "6", ref: "#TZ8W44NXBC", amount: 1000, status: "APPROVED",
    orderId: "Vb9cPdEfGhIjKlM", clientName: "BT247_Sharma44", clientUpi: "SKIP_UPI",
    assignedUpi: "8765432109@okaxis", createdOn: "Fri 08 May 2026, 15:30",
    totalAmount: 1000, discountAmount: 0, assignedTo: "Neha okaxis",
    assignedOn: "Fri 08 May 2026, 15:31", remarks: "No remarks",
  },
  {
    id: "7", ref: "#YD2F58MQVR", amount: 2000, status: "APPROVED",
    orderId: "Nq3rSt4UvWxYzAb", clientName: "PLYBG_Verma88", clientUpi: "SKIP_UPI",
    assignedUpi: "7654321098@paytm", createdOn: "Fri 08 May 2026, 15:15",
    totalAmount: 2000, discountAmount: 50, assignedTo: "Ravi paytm",
    assignedOn: "Fri 08 May 2026, 15:16", remarks: "Discount applied",
    hasReceipt: true,
  },
  {
    id: "8", ref: "#PL6H73BSNK", amount: 5000, status: "APPROVED",
    orderId: "Cd5eF6gH7iJ8kL9", clientName: "BT247_Patel99", clientUpi: "SKIP_UPI",
    assignedUpi: "6543210987@icici", createdOn: "Fri 08 May 2026, 15:00",
    totalAmount: 5000, discountAmount: 0, assignedTo: "Deepak icici",
    assignedOn: "Fri 08 May 2026, 15:01", remarks: "No remarks",
    hasReceipt: true,
  },
  {
    id: "9", ref: "#MN4C29WXOP", amount: 1000, status: "APPROVED",
    orderId: "Mn7pQx2Ry8vTb2Y", clientName: "PLYBG_Singh12", clientUpi: "SKIP_UPI",
    assignedUpi: "5432109876@upi", createdOn: "Fri 08 May 2026, 14:50",
    totalAmount: 1000, discountAmount: 0, assignedTo: "Anjali upi",
    assignedOn: "Fri 08 May 2026, 14:51", remarks: "No remarks",
  },
  {
    id: "10", ref: "#AX7R14DQEL", amount: 300, status: "APPROVED",
    orderId: "Op1qR2sT3uV4wX5", clientName: "BT247_Gupta77", clientUpi: "SKIP_UPI",
    assignedUpi: "4321098765@hdfc", createdOn: "Fri 08 May 2026, 14:35",
    totalAmount: 300, discountAmount: 0, assignedTo: "Vikram hdfc",
    assignedOn: "Fri 08 May 2026, 14:36", remarks: "No remarks",
  },
  {
    id: "11", ref: "#BQ9S36ZFGM", amount: 1000, status: "PROCESSING",
    orderId: "Yb6cD7eF8gH9iJ0", clientName: "PLYBG_Mehta55", clientUpi: "SKIP_UPI",
    assignedUpi: "3210987654@sbi", createdOn: "Fri 08 May 2026, 14:20",
    totalAmount: 1000, discountAmount: 0, assignedTo: "Pooja sbi",
    assignedOn: "Fri 08 May 2026, 14:21", remarks: "Under review",
    hasReceipt: true,
  },
  {
    id: "12", ref: "#CR5T81LHWN", amount: 750, status: "EXPIRED",
    orderId: "Kl1mN2oP3qR4sT5", clientName: "BT247_Joshi34", clientUpi: "SKIP_UPI",
    assignedUpi: "2109876543@axis", createdOn: "Fri 08 May 2026, 12:00",
    totalAmount: 750, discountAmount: 0, assignedTo: "Manish axis",
    assignedOn: "Fri 08 May 2026, 12:01", remarks: "Expired — no payment",
  },
  {
    id: "13", ref: "#DV2U47YKBT", amount: 1500, status: "RECEIPT_PENDING",
    orderId: "Uv6wX7yZ8aB9cD0", clientName: "PLYBG_Nair21", clientUpi: "SKIP_UPI",
    assignedUpi: "1098765432@kotak", createdOn: "Fri 08 May 2026, 13:30",
    totalAmount: 1500, discountAmount: 0, assignedTo: "Lakshmi kotak",
    assignedOn: "Fri 08 May 2026, 13:31", remarks: "Awaiting receipt upload",
  },
  {
    id: "14", ref: "#EW3V58ZMCU", amount: 2500, status: "UNASSIGNED",
    orderId: "Ef1gH2iJ3kL4mN5", clientName: "BT247_Rao66", clientUpi: "SKIP_UPI",
    assignedUpi: "—", createdOn: "Fri 08 May 2026, 16:05",
    totalAmount: 2500, discountAmount: 0, assignedTo: "—",
    assignedOn: "—", remarks: "Not yet assigned",
  },
];

const STATUS_TABS: { label: string; value: PayInStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Reciept Pending", value: "RECEIPT_PENDING" },
  { label: "Unassigned", value: "UNASSIGNED" },
];

const statusStyle: Record<PayInStatus, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  EXPIRED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  RECEIPT_PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  UNASSIGNED: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  PROCESSING: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

const showApprove = (s: PayInStatus) => s === "PENDING" || s === "PROCESSING";
const showDispute = (s: PayInStatus) => s === "PENDING" || s === "PROCESSING";

function MoneyIcon() {
  return (
    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="6" width="20" height="13" rx="2" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeWidth={1.5} d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="inline w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

function ApproveButton() {
  return (
    <button className="flex items-center gap-1.5 rounded-full bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Approve
    </button>
  );
}

function DisputeButton() {
  return (
    <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      Dispute
    </button>
  );
}

function ChevronBtn({ rotated, onClick }: { rotated: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <svg className={`w-4 h-4 transition-transform duration-200 ${rotated ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function PayInCard({ item }: { item: PayInItem }) {
  // Desktop: chevron toggles extra details (Total Amount, Discount, etc.)
  // Mobile: chevron toggles all details
  const [extraOpen, setExtraOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRow = (
    <div className="flex items-center gap-3 px-5 py-3.5">
      {/* ref + amount + status */}
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.ref}</span>
        <MoneyIcon />
        <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
          {item.amount.toLocaleString("en-IN")} INR
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${statusStyle[item.status]}`}>
          {item.status.replace("_", " ")}
        </span>
      </div>

      {/* right-side action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {showDispute(item.status) && <DisputeButton />}
        {item.hasReceipt && (
          <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ReceiptIcon />
          </button>
        )}
        {/* Mobile chevron — toggles all details */}
        <span className="lg:hidden">
          <ChevronBtn rotated={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
        </span>
        {/* Desktop chevron — toggles extra details */}
        <span className="hidden lg:inline-flex">
          <ChevronBtn rotated={extraOpen} onClick={() => setExtraOpen((v) => !v)} />
        </span>
        {/* Mobile approve (in header) */}
        {showApprove(item.status) && (
          <span className="lg:hidden">
            <ApproveButton />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
      {/* ── Header ── */}
      {headerRow}

      {/* ── DESKTOP: always-visible primary detail rows ── */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800 px-5 py-4">
        {/* Row 1: ORDER ID · CLIENT NAME · CLIENT UPI */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-1 mb-4">
          <DetailField label="Order ID" value={item.orderId} />
          <DetailField label="Client Name" value={item.clientName} />
          <DetailField label="Client UPI" value={item.clientUpi} />
        </div>

        {/* Row 2: UTR (if any) · ASSIGNED UPI · CREATED ON + Approve at far right */}
        <div className="flex items-end gap-8">
          {item.utrCode && (
            <div className="shrink-0">
              <DetailField label="UTR Code" value={item.utrCode} />
            </div>
          )}
          <div className="shrink-0">
            <DetailField label="Assigned UPI" value={item.assignedUpi} isLink={item.assignedUpi !== "—"} />
          </div>
          <div className="shrink-0">
            <DetailField label="Created On" value={item.createdOn} />
          </div>
          {showApprove(item.status) && (
            <div className="ml-auto shrink-0">
              <ApproveButton />
            </div>
          )}
        </div>

        {/* Extra rows (toggled by chevron) */}
        {extraOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-4">
              <DetailField label="Total Amount" value={`${item.totalAmount} INR`} />
              <DetailField label="Discount Amount" value={`${item.discountAmount} INR`} />
              <DetailField label="Assigned To" value={item.assignedTo} />
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <DetailField label="Assigned On" value={item.assignedOn} />
              <DetailField label="Remarks" value={item.remarks} />
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE: accordion detail panel ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <DetailField label="Order ID" value={item.orderId} />
            <DetailField label="Client Name" value={item.clientName} />
            <DetailField label="Client UPI" value={item.clientUpi} />
          </div>
          {item.utrCode && (
            <div className="mb-4">
              <DetailField label="UTR Code" value={item.utrCode} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <DetailField label="Assigned UPI" value={item.assignedUpi} isLink={item.assignedUpi !== "—"} />
            <DetailField label="Created On" value={item.createdOn} />
            <DetailField label="Total Amount" value={`${item.totalAmount} INR`} />
            <DetailField label="Discount Amount" value={`${item.discountAmount} INR`} />
            <DetailField label="Assigned To" value={item.assignedTo} />
            <DetailField label="Assigned On" value={item.assignedOn} />
            <DetailField label="Remarks" value={item.remarks} />
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_FILTER_OPTIONS = ["All", "PENDING", "APPROVED", "EXPIRED", "RECEIPT_PENDING", "UNASSIGNED", "PROCESSING"];

export default function PayInList() {
  const [activeTab, setActiveTab] = useState<PayInStatus | "ALL">("ALL");
  const [showFilter, setShowFilter] = useState(false);

  // Advanced search state
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Pagination
  const [page, setPage] = useState(1);

  const totalOrders = 90674;

  const counts: Partial<Record<PayInStatus | "ALL", number>> = {
    ALL: mockData.length,
    PENDING: mockData.filter((d) => d.status === "PENDING").length,
    APPROVED: mockData.filter((d) => d.status === "APPROVED").length,
    EXPIRED: mockData.filter((d) => d.status === "EXPIRED").length,
    RECEIPT_PENDING: mockData.filter((d) => d.status === "RECEIPT_PENDING").length,
    UNASSIGNED: mockData.filter((d) => d.status === "UNASSIGNED").length,
    PROCESSING: mockData.filter((d) => d.status === "PROCESSING").length,
  };

  const filtered = mockData.filter((d) => {
    if (activeTab !== "ALL" && d.status !== activeTab) return false;
    if (search && !d.orderId.toLowerCase().includes(search.toLowerCase()) &&
      !d.clientName.toLowerCase().includes(search.toLowerCase()) &&
      !d.assignedUpi.toLowerCase().includes(search.toLowerCase()) &&
      !(d.utrCode ?? "").includes(search)) return false;
    if (amount && d.amount !== Number(amount)) return false;
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <PiContactlessPaymentFill className="w-6 h-6" />
        <h1 className="text-xl font-bold">Pay In</h1>
      </div>

      {showFilter && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Advanced Search</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                  </svg>
                  {totalOrders.toLocaleString()} Orders found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search & Filter section */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Filter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search input */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, UPI, order ID..."
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>
              {/* Amount input */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>
              {/* Status dropdown */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                >
                  {STATUS_FILTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "RECEIPT_PENDING" ? "Receipt Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Helper text */}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Peer / Client Name, UPI, Order ID, Receipt, UTR
            </p>
          </div>

          {/* Date Range section */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date Range</span>
            </div>

            {/* Full-width date range trigger */}
            <div className="w-full">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                fullWidth
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 pb-4">
            <button
              onClick={() => setShowFilter(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
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
            const count = counts[tab.value];
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1); }}
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

        {/* Filter toggle icon */}
        <button
          onClick={() => setShowFilter((v) => !v)}
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

      {/* Cards list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-6 py-12 text-center text-gray-400">
            No transactions found.
          </div>
        ) : (
          paginated.map((item) => <PayInCard key={item.id} item={item} />)
        )}
      </div>

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
