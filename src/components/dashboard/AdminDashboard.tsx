"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { csvExportTimestamp, downloadCsv } from "@/lib/csv-download";

/* ── Types ── */
interface VendorRow {
  id: string;
  name: string;
  security: number;
  manualPayIn: number;
  approvedPayIn: number;
  discounted: number;
  netPayIn: number;
  payout: number;
  unsettlePayout: number;
  settlement: number;
  net: number;
  prevBalance: number;
  payInCommission: number;
  payOutCommission: number;
  referralCommission: number;
  running: number;
  runningUnsettled: number;
  credit: number;
  finalBalance: number;
  remainingBalance: number;
}


function EditableCreditCell({
  rowId,
  value,
  onSave,
}: {
  rowId: string;
  value: number;
  onSave: (id: string, next: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const display =
    value > 0 ? (
      <span className="text-green-600 dark:text-green-400 font-semibold">{value.toLocaleString("en-IN")}</span>
    ) : (
      <span>0</span>
    );

  const startEdit = () => {
    setDraft(value === 0 ? "" : String(value));
    setEditing(true);
  };

  const commit = () => {
    const normalized = draft.replace(/,/g, "").trim();
    const parsed = normalized === "" ? 0 : Number(normalized);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      setEditing(false);
      return;
    }
    onSave(rowId, parsed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 py-0.5">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="w-24 min-w-0 rounded-md border border-brand-300 bg-white px-2 py-1 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-brand-600 dark:bg-gray-900 dark:text-gray-100"
          autoFocus
        />
        <button
          type="button"
          onClick={commit}
          className="rounded-md bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-brand-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="group/credit relative flex min-h-[1.75rem] items-center gap-1">
      {display}
      <button
        type="button"
        title="Extra PayIn headroom beyond the security pool (credit limit). Click to edit."
        onClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        className="inline-flex shrink-0 items-center justify-center rounded p-0.5 text-gray-400 opacity-100 transition-opacity hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>
    </div>
  );
}

/* ── Helpers ── */
const fmt = (n: number) => {
  if (n === 0) return "0";
  const abs = Math.abs(n).toLocaleString("en-IN");
  return n < 0 ? `-${abs}` : abs;
};

/** Percent fields from `agents` (e.g. 2.5 → 2.5%). */
const fmtPct = (n: number) => {
  if (!Number.isFinite(n) || n === 0) return "0%";
  const t = (Math.round(n * 100) / 100).toString().replace(/\.0+$/, "");
  return `${t}%`;
};

const colorVal = (n: number, zeroDash = false) => {
  if (n === 0) return zeroDash ? <span className="text-gray-400">0</span> : <span>0</span>;
  return <span className={n > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{fmt(n)}</span>;
};

const badge = (n: number) => (
  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${n > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : n < 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
    }`}>{fmt(n)}</span>
);

const colHdr = "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";
const colCell = "px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";
/** Wide enough for two icon buttons + slide offset + label pills (getActionLabelSpace ≤ 220px) */
const colActions = "min-w-[240px] w-[240px] max-w-[240px] text-center align-middle";

const TABLE_TOOLBAR_ICONS: { id: "menu" | "totals" | "highlight" | "inactive" | "headerFilters" | "customize"; icon: React.ReactNode }[] = [
  {
    id: "menu",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l2 2m0 0l2-2m-2 2v-6" />
      </svg>
    ),
  },
  {
    id: "totals",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
      </svg>
    ),
  },
  {
    id: "highlight",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M3 12h2m14 0h2" />
      </svg>
    ),
  },
  {
    id: "inactive",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
      </svg>
    ),
  },
  {
    id: "headerFilters",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
      </svg>
    ),
  },
  {
    id: "customize",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 14h4a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 17v-4m6 4v-4M9 7h6" />
      </svg>
    ),
  },
];

type StatsColKey =
  | "vendor"
  | "security"
  | "manualPayIn"
  | "approvedPayIn"
  | "discounted"
  | "netPayIn"
  | "payout"
  | "unsettlePayout"
  | "settlement"
  | "net"
  | "running"
  | "runningUnsettled"
  | "credit"
  | "finalBalance"
  | "remainingBalance"
  | "prevBalance"
  | "payInCommission"
  | "payOutCommission"
  | "referralCommission"
  | "actions";

const FIN_STATS_COLUMNS: { key: StatsColKey; label: string }[] = [
  { key: "vendor", label: "Vendor" },
  { key: "security", label: "Security" },
  { key: "manualPayIn", label: "Manual PayIn" },
  { key: "approvedPayIn", label: "Approved PayIn" },
  { key: "discounted", label: "Discounted" },
  { key: "netPayIn", label: "Net PayIn" },
  { key: "payout", label: "Payout" },
  { key: "unsettlePayout", label: "Unsettle Payout" },
  { key: "settlement", label: "Settlement" },
  { key: "net", label: "Net" },
  { key: "running", label: "Running" },
  { key: "runningUnsettled", label: "Running Unsettled" },
  { key: "credit", label: "Credit" },
  { key: "finalBalance", label: "Final Balance" },
  { key: "remainingBalance", label: "Remaining Balance" },
  { key: "prevBalance", label: "Previous Balance" },
  { key: "payInCommission", label: "PayIn %" },
  { key: "payOutCommission", label: "PayOut %" },
  { key: "referralCommission", label: "Referral %" },
  { key: "actions", label: "Actions" },
];

function defaultColBoolMap(value: boolean): Record<StatsColKey, boolean> {
  return Object.fromEntries(FIN_STATS_COLUMNS.map((c) => [c.key, value])) as Record<StatsColKey, boolean>;
}

/** Rows treated as “inactive” for the toolbar filter (no meaningful pay-in / payout / running flow). */
function isInactiveVendorRow(r: VendorRow): boolean {
  return (
    r.approvedPayIn === 0 &&
    r.manualPayIn === 0 &&
    r.payout === 0 &&
    r.unsettlePayout === 0 &&
    r.running === 0 &&
    r.netPayIn === 0 &&
    r.security === 0
  );
}

function vendorRowCsvCell(row: VendorRow, key: StatsColKey): string {
  if (key === "vendor") return row.name;
  if (key === "actions") return "";
  const v = row[key as keyof VendorRow];
  if (typeof v === "number") return String(v);
  return String(v ?? "");
}

/* ── Tooltip wrapper ── */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] font-medium
                        rounded px-2 py-0.5 whitespace-nowrap shadow-lg">
          {label}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </div>
    </div>
  );
}

/* ── Component ── */
export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredToolbarIndex, setHoveredToolbarIndex] = useState<number | null>(null);
  const [hoveredTableActionIndex, setHoveredTableActionIndex] = useState<number | null>(null);
  /** Per vendor row: which action slot (0 View, 1 Remove) is hovered — same slide + label animation as table toolbar */
  const [vendorRowHoveredAction, setVendorRowHoveredAction] = useState<{ rowId: string; slot: 0 | 1 } | null>(null);
  const [removeConfirmVendorId, setRemoveConfirmVendorId] = useState<string | null>(null);

  const tableToolbarRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [showTotalsRow, setShowTotalsRow] = useState(true);
  const [hideHeaderFilters, setHideHeaderFilters] = useState(false);
  const [rowActivityFilter, setRowActivityFilter] = useState<"all" | "active" | "inactive">("all");
  const [colVisible, setColVisible] = useState<Record<StatsColKey, boolean>>(() => defaultColBoolMap(true));
  const [colHighlight, setColHighlight] = useState<Record<StatsColKey, boolean>>(() => defaultColBoolMap(false));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; rows?: VendorRow[]; error?: string };
      if (res.status === 401) {
        setLoadError("Admin sign-in required.");
        setRows([]);
        return;
      }
      if (!res.ok || !data.ok || !data.rows) {
        setLoadError(data.error ?? "Could not load dashboard.");
        setRows([]);
        return;
      }
      setRows(data.rows.map((r) => ({ ...r })));
    } catch {
      setLoadError("Network error.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const z: Omit<VendorRow, "id" | "name"> = {
      security: 0,
      manualPayIn: 0,
      approvedPayIn: 0,
      discounted: 0,
      netPayIn: 0,
      payout: 0,
      unsettlePayout: 0,
      settlement: 0,
      net: 0,
      prevBalance: 0,
      payInCommission: 0,
      payOutCommission: 0,
      referralCommission: 0,
      running: 0,
      runningUnsettled: 0,
      credit: 0,
      finalBalance: 0,
      remainingBalance: 0,
    };
    return rows.reduce(
      (acc, r) => ({
        security: acc.security + r.security,
        manualPayIn: acc.manualPayIn + r.manualPayIn,
        approvedPayIn: acc.approvedPayIn + r.approvedPayIn,
        discounted: acc.discounted + r.discounted,
        netPayIn: acc.netPayIn + r.netPayIn,
        payout: acc.payout + r.payout,
        unsettlePayout: acc.unsettlePayout + r.unsettlePayout,
        settlement: acc.settlement + r.settlement,
        net: acc.net + r.net,
        prevBalance: acc.prevBalance + r.prevBalance,
        payInCommission: acc.payInCommission,
        payOutCommission: acc.payOutCommission,
        referralCommission: acc.referralCommission,
        running: acc.running + r.running,
        runningUnsettled: acc.runningUnsettled + r.runningUnsettled,
        credit: acc.credit + r.credit,
        finalBalance: acc.finalBalance + r.finalBalance,
        remainingBalance: acc.remainingBalance + r.remainingBalance,
      }),
      z,
    );
  }, [rows]);

  const saveRowCredit = (id: string, next: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, credit: next } : r)));
  };
  const getActionLabelSpace = (label: string) =>
    Math.max(72, Math.min(220, label.length * 7 + 24));

  const tableToolbarHoverLabel = (idx: number): string => {
    switch (idx) {
      case 0:
        return "Menu / Options List";
      case 1:
        return showTotalsRow ? "Hide Totals" : "Show Totals";
      case 2:
        return "Highlight";
      case 3:
        return "Show Inactive (active or inactive)";
      case 4:
        return hideHeaderFilters ? "Show Header Filters" : "Hide Header Filters";
      case 5:
        return `Customize Columns (${FIN_STATS_COLUMNS.length})`;
      default:
        return "";
    }
  };

  useEffect(() => {
    if (!removeConfirmVendorId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRemoveConfirmVendorId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [removeConfirmVendorId]);

  useEffect(() => {
    if (!menuOpen && !highlightMenuOpen && !columnsMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (tableToolbarRef.current && !tableToolbarRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setHighlightMenuOpen(false);
        setColumnsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen, highlightMenuOpen, columnsMenuOpen]);

  const confirmRemoveVendor = () => {
    if (!removeConfirmVendorId) return;
    setRows((prev) => prev.filter((r) => r.id !== removeConfirmVendorId));
    setRemoveConfirmVendorId(null);
  };

  const topActions = [
    {
      label: "Add Interledger Entry",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l-4 5 4 5M17 7l4 5-4 5M10 6l4 12" />
        </svg>
      ),
    },
    {
      label: "Add Security Deposit",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.2-2.7 7.8-7 10-4.3-2.2-7-5.8-7-10V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v6M9 11h6" />
        </svg>
      ),
    },
    {
      label: "Add Settlement",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v4M10 15h4" />
        </svg>
      ),
    },
    {
      label: "Export Data",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v11m0 0l-4-4m4 4l4-4M4 16v2a3 3 0 003 3h10a3 3 0 003-3v-2" />
        </svg>
      ),
    },
    {
      label: "Manual PayIn (CSV)",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M12 17V11m0 0l-2 2m2-2l2 2M8 20h8" />
        </svg>
      ),
    },
    {
      label: "Commission Settlement (CSV)",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8.5 15.5l2.1 2.1 4.9-4.9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
        </svg>
      ),
    },
    {
      label: "Manual Deposit",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2M12 11v6M9 14h6" />
        </svg>
      ),
    },
  ] as const;

  const filtered = useMemo(() => {
    let list = rows.filter(
      (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
    );
    if (rowActivityFilter === "active") list = list.filter((r) => !isInactiveVendorRow(r));
    if (rowActivityFilter === "inactive") list = list.filter((r) => isInactiveVendorRow(r));
    return list;
  }, [rows, search, rowActivityFilter]);

  const exportFinancialCsv = useCallback(
    (opts: { visibleColumnsOnly: boolean }) => {
      const cols = FIN_STATS_COLUMNS.filter(
        (c) => c.key !== "actions" && (!opts.visibleColumnsOnly || colVisible[c.key]),
      );
      if (cols.length === 0) {
        window.alert("Select at least one data column to export.");
        return;
      }
      const header = cols.map((c) => c.label);
      const dataRows = filtered.map((row) => cols.map((c) => vendorRowCsvCell(row, c.key)));
      downloadCsv(
        `admin-financial${opts.visibleColumnsOnly ? "-view" : ""}-${csvExportTimestamp()}.csv`,
        [header, ...dataRows],
      );
    },
    [filtered, colVisible],
  );

  const hoveredLabelSpacePx =
    hoveredToolbarIndex === null ? 0 : getActionLabelSpace(topActions[hoveredToolbarIndex].label);
  const hoveredTableActionSpacePx =
    hoveredTableActionIndex === null
      ? 0
      : getActionLabelSpace(tableToolbarHoverLabel(hoveredTableActionIndex));

  const xh = (k: StatsColKey) => (colHighlight[k] ? " bg-amber-50/90 dark:bg-amber-950/35" : "");
  const xv = (k: StatsColKey) => (colVisible[k] ? "" : " hidden");
  const visibleColCount = FIN_STATS_COLUMNS.filter((c) => colVisible[c.key]).length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            {/* Pie chart icon */}
            <svg className="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2a10 10 0 1 0 10 10h-10z" />
              <path d="M13 2.05A10 10 0 0 1 21.95 11H13z" opacity="0.5" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-7">
            Live agent balances from the database — columns without data stay at 0 (nothing is hidden).
          </p>
        </div>

        {/* Right-side toolbar — animated action rail */}
        <div className="relative flex items-center gap-0.5 flex-wrap">
          {topActions.map((action, idx) => {
            const isHovered = hoveredToolbarIndex === idx;
            const isLeftOfHovered = hoveredToolbarIndex !== null && idx < hoveredToolbarIndex;
            return (
              <div
                key={action.label}
                className="group relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: isLeftOfHovered ? `translateX(-${hoveredLabelSpacePx}px)` : "translateX(0px)",
                }}
                onMouseEnter={() => setHoveredToolbarIndex(idx)}
                onMouseLeave={() => setHoveredToolbarIndex(null)}
              >
                <button
                  type="button"
                  aria-label={action.label}
                  className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (idx === 2) router.push("/settlement-log");
                    else if (idx === 3) exportFinancialCsv({ visibleColumnsOnly: false });
                    else if (idx === 4) {
                      downloadCsv(`manual-payin-template-${csvExportTimestamp()}.csv`, [
                        ["order_id", "amount", "client_name", "client_upi", "utr", "remarks"],
                      ]);
                    } else if (idx === 5) {
                      downloadCsv(`commission-settlement-template-${csvExportTimestamp()}.csv`, [
                        [
                          "vendor_id",
                          "vendor_name",
                          "settlement_amount",
                          "period_from_YYYY-MM-DD",
                          "period_to_YYYY-MM-DD",
                          "remarks",
                        ],
                      ]);
                    }
                  }}
                >
                  {action.icon}
                </button>
                <span
                  className={`pointer-events-none absolute right-7 top-1/2 z-20 w-fit -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-200 shadow-sm text-right transition-all duration-200 ease-out
                    opacity-0 translate-x-1 scale-95
                    group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100`}
                >
                  {action.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Financial Statistics card ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {loadError && (
          <div className="px-5 py-3 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/25 border-b border-amber-100 dark:border-amber-900/40">
            {loadError}{" "}
            <Link href="/signin/admin" className="font-semibold underline">
              Sign in as admin
            </Link>
          </div>
        )}
        {loading && (
          <div className="px-5 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            Loading dashboard…
          </div>
        )}
        {/* Card header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Financial Statistics</h2>
          <div className="flex items-center gap-1">
            <div className="relative flex flex-wrap items-center gap-0.5" ref={tableToolbarRef}>
              {TABLE_TOOLBAR_ICONS.map((item, idx) => {
                const isHovered = hoveredTableActionIndex === idx;
                const isLeftOfHovered = hoveredTableActionIndex !== null && idx < hoveredTableActionIndex;
                const label = tableToolbarHoverLabel(idx);
                return (
                  <div
                    key={item.id}
                    className="group relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: isLeftOfHovered ? `translateX(-${hoveredTableActionSpacePx}px)` : "translateX(0px)",
                    }}
                    onMouseEnter={() => setHoveredTableActionIndex(idx)}
                    onMouseLeave={() => setHoveredTableActionIndex(null)}
                  >
                    <button
                      type="button"
                      aria-label={label}
                      className="relative z-10 flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.id === "menu") {
                          setHighlightMenuOpen(false);
                          setColumnsMenuOpen(false);
                          setMenuOpen((o) => !o);
                        } else if (item.id === "totals") {
                          setShowTotalsRow((s) => !s);
                        } else if (item.id === "highlight") {
                          setMenuOpen(false);
                          setColumnsMenuOpen(false);
                          setHighlightMenuOpen((o) => !o);
                        } else if (item.id === "inactive") {
                          setRowActivityFilter((m) => (m === "all" ? "active" : m === "active" ? "inactive" : "all"));
                        } else if (item.id === "headerFilters") {
                          setHideHeaderFilters((h) => !h);
                        } else if (item.id === "customize") {
                          setMenuOpen(false);
                          setHighlightMenuOpen(false);
                          setColumnsMenuOpen((o) => !o);
                        }
                      }}
                    >
                      {item.icon}
                    </button>
                    <span
                      className={`pointer-events-none absolute right-6 top-1/2 z-30 w-fit max-w-[220px] -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white/95 px-2 py-1 text-right text-[11px] font-medium text-gray-600 shadow-sm transition-all duration-200 ease-out dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200
                        opacity-0 translate-x-1 scale-95
                        group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 text-left text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">Options</div>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => {
                      setMenuOpen(false);
                      void load();
                    }}
                  >
                    Refresh summary
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => {
                      exportFinancialCsv({ visibleColumnsOnly: true });
                      setMenuOpen(false);
                    }}
                  >
                    Export view…
                  </button>
                </div>
              )}

              {highlightMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Highlight columns
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {FIN_STATS_COLUMNS.map((c) => (
                      <label
                        key={c.key}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800"
                          checked={colHighlight[c.key]}
                          onChange={() =>
                            setColHighlight((prev) => ({ ...prev, [c.key]: !prev[c.key] }))
                          }
                        />
                        <span className="truncate">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {columnsMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Customize columns ({FIN_STATS_COLUMNS.length})
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {FIN_STATS_COLUMNS.map((c) => (
                      <label
                        key={`vis-${c.key}`}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800"
                          checked={colVisible[c.key]}
                          onChange={() =>
                            setColVisible((prev) => {
                              const next = { ...prev, [c.key]: !prev[c.key] };
                              if (!FIN_STATS_COLUMNS.some((col) => next[col.key])) return prev;
                              return next;
                            })
                          }
                        />
                        <span className="truncate">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!hideHeaderFilters && (
              <>
                <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <span className="pr-1 text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
                  Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span>{" "}
                  results
                  {rowActivityFilter !== "all" && (
                    <span className="ml-1 text-[10px] font-semibold text-blue-500 dark:text-blue-400">
                      ({rowActivityFilter})
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Table (horizontal scroll) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "2000px" }}>
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-gray-800">
                <th className={`${colHdr} sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 min-w-[140px]${xh("vendor")}${xv("vendor")}`}>Vendor</th>
                <th className={`${colHdr}${xh("security")}${xv("security")}`}>Security</th>
                <th className={`${colHdr}${xh("manualPayIn")}${xv("manualPayIn")}`}>
                  Manual PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr}${xh("approvedPayIn")}${xv("approvedPayIn")}`}>
                  Approved PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr}${xh("discounted")}${xv("discounted")}`}>Discounted</th>
                <th className={`${colHdr}${xh("netPayIn")}${xv("netPayIn")}`}>Net PayIn</th>
                <th className={`${colHdr}${xh("payout")}${xv("payout")}`}>Payout</th>
                <th className={`${colHdr}${xh("unsettlePayout")}${xv("unsettlePayout")}`}>Unsettle Payout</th>
                <th className={`${colHdr}${xh("settlement")}${xv("settlement")}`}>Settlement</th>
                <th className={`${colHdr}${xh("net")}${xv("net")}`}>
                  Net&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr}${xh("running")}${xv("running")}`}>Running</th>
                <th className={`${colHdr}${xh("runningUnsettled")}${xv("runningUnsettled")}`}>Running Unsettled</th>
                <th
                  className={`${colHdr}${xh("credit")}${xv("credit")}`}
                  title="Extra PayIn headroom beyond the security pool: allowed exposure even when deposit-backed room is used up."
                >
                  Credit
                </th>
                <th className={`${colHdr}${xh("finalBalance")}${xv("finalBalance")}`}>Final Balance</th>
                <th className={`${colHdr}${xh("remainingBalance")}${xv("remainingBalance")}`}>Remaining Balance</th>
                <th className={`${colHdr}${xh("prevBalance")}${xv("prevBalance")}`}>Previous Balance</th>
                <th className={`${colHdr}${xh("payInCommission")}${xv("payInCommission")}`} title="Pay-in commission % (agent)">
                  PayIn %&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr}${xh("payOutCommission")}${xv("payOutCommission")}`} title="Pay-out commission % (agent)">
                  PayOut %&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr}${xh("referralCommission")}${xv("referralCommission")}`} title="Referral commission % (agent)">
                  Referral %&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={`${colHdr} ${colActions}${xh("actions")}${xv("actions")}`}>Actions</th>
              </tr>

              {showTotalsRow && (
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-white/[0.04]">
                  <td className={`${colCell} sticky left-0 z-10 bg-gray-100 dark:bg-gray-900 font-bold text-gray-600 dark:text-gray-300${xh("vendor")}${xv("vendor")}`}>Vendor</td>
                  <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400${xh("security")}${xv("security")}`}>{totals.security.toLocaleString("en-IN")}</td>
                  <td className={`${colCell}${xh("manualPayIn")}${xv("manualPayIn")}`}>{totals.manualPayIn}</td>
                  <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400${xh("approvedPayIn")}${xv("approvedPayIn")}`}>{totals.approvedPayIn.toLocaleString("en-IN")}</td>
                  <td className={`${colCell}${xh("discounted")}${xv("discounted")}`}>{totals.discounted}</td>
                  <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400${xh("netPayIn")}${xv("netPayIn")}`}>{totals.netPayIn.toLocaleString("en-IN")}</td>
                  <td className={`${colCell} font-bold text-orange-500${xh("payout")}${xv("payout")}`}>{totals.payout.toLocaleString("en-IN")}</td>
                  <td className={`${colCell} font-bold text-red-500${xh("unsettlePayout")}${xv("unsettlePayout")}`}>{fmt(totals.unsettlePayout)}</td>
                  <td className={`${colCell}${xh("settlement")}${xv("settlement")}`}>{totals.settlement.toLocaleString("en-IN")}</td>
                  <td className={`${colCell} font-bold text-red-500${xh("net")}${xv("net")}`}>{fmt(totals.net)}</td>
                  <td className={`${colCell}${xh("running")}${xv("running")}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{(totals.running / 1000).toFixed(0)}K</span>
                      <span className="text-blue-500 font-semibold text-[10px]">{totals.runningUnsettled.toLocaleString("en-IN")}</span>
                    </div>
                  </td>
                  <td className={`${colCell}${xh("runningUnsettled")}${xv("runningUnsettled")}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{totals.runningUnsettled.toLocaleString("en-IN")}</span>
                      <span className="text-orange-500 font-semibold text-[10px]">{(totals.runningUnsettled * 0.87).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400${xh("credit")}${xv("credit")}`}>{(totals.credit / 1000000).toFixed(0)}M</td>
                  <td className={`${colCell} font-bold text-green-600 dark:text-green-400${xh("finalBalance")}${xv("finalBalance")}`}>{totals.finalBalance.toLocaleString("en-IN")}</td>
                  <td className={`${colCell} font-bold text-green-600 dark:text-green-400${xh("remainingBalance")}${xv("remainingBalance")}`}>{totals.remainingBalance.toLocaleString("en-IN")}</td>
                  <td className={`${colCell}${xh("prevBalance")}${xv("prevBalance")}`}>{totals.prevBalance}</td>
                  <td className={`${colCell} text-gray-400${xh("payInCommission")}${xv("payInCommission")}`}>—</td>
                  <td className={`${colCell} text-gray-400${xh("payOutCommission")}${xv("payOutCommission")}`}>—</td>
                  <td className={`${colCell} text-gray-400${xh("referralCommission")}${xv("referralCommission")}`}>—</td>
                  <td className={`${colCell} ${colActions}${xh("actions")}${xv("actions")}`}></td>
                </tr>
              )}
            </thead>

            <tbody>
              {filtered.map((row) => {
                const rowHover = vendorRowHoveredAction?.rowId === row.id ? vendorRowHoveredAction : null;
                const vendorRowHoveredSpacePx =
                  rowHover == null ? 0 : getActionLabelSpace(rowHover.slot === 0 ? "View" : "Remove");

                return (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-blue-50/30 dark:hover:bg-white/[0.015] transition-colors">
                    {/* Vendor name — sticky */}
                    <td className={`${colCell} sticky left-0 z-10 bg-white dark:bg-gray-900 font-semibold text-gray-800 dark:text-gray-200${xh("vendor")}${xv("vendor")}`}>
                      <Link href={`/agent/${row.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {row.name}
                      </Link>
                    </td>

                    <td className={`${colCell}${xh("security")}${xv("security")}`}>{row.security > 0 ? row.security.toLocaleString("en-IN") : "0"}</td>
                    <td className={`${colCell}${xh("manualPayIn")}${xv("manualPayIn")}`}>{row.manualPayIn}</td>
                    <td className={`${colCell}${xh("approvedPayIn")}${xv("approvedPayIn")}`}>{row.approvedPayIn > 0 ? row.approvedPayIn.toLocaleString("en-IN") : "0"}</td>
                    <td className={`${colCell}${xh("discounted")}${xv("discounted")}`}>{row.discounted}</td>
                    <td className={`${colCell}${xh("netPayIn")}${xv("netPayIn")}`}>{row.netPayIn > 0 ? row.netPayIn.toLocaleString("en-IN") : "0"}</td>
                    <td className={`${colCell}${xh("payout")}${xv("payout")}`}>{row.payout > 0 ? row.payout.toLocaleString("en-IN") : "0"}</td>
                    <td className={`${colCell}${xh("unsettlePayout")}${xv("unsettlePayout")}`}>{colorVal(row.unsettlePayout, true)}</td>
                    <td className={`${colCell}${xh("settlement")}${xv("settlement")}`}>{colorVal(row.settlement, true)}</td>
                    <td className={`${colCell}${xh("net")}${xv("net")}`}>{colorVal(row.net, true)}</td>

                    {/* Running — badge */}
                    <td className={`${colCell}${xh("running")}${xv("running")}`}>
                      {badge(row.running)}
                    </td>

                    {/* Running Unsettled — badge */}
                    <td className={`${colCell}${xh("runningUnsettled")}${xv("runningUnsettled")}`}>
                      {badge(row.runningUnsettled)}
                    </td>

                    <td className={`${colCell}${xh("credit")}${xv("credit")}`}>
                      <EditableCreditCell rowId={row.id} value={row.credit} onSave={saveRowCredit} />
                    </td>

                    {/* Final Balance */}
                    <td className={`${colCell}${xh("finalBalance")}${xv("finalBalance")}`}>{colorVal(row.finalBalance, true)}</td>

                    {/* Remaining Balance */}
                    <td className={`${colCell}${xh("remainingBalance")}${xv("remainingBalance")}`}>{colorVal(row.remainingBalance, true)}</td>

                    <td className={`${colCell}${xh("prevBalance")}${xv("prevBalance")}`}>{row.prevBalance}</td>
                    <td className={`${colCell}${xh("payInCommission")}${xv("payInCommission")}`}>{fmtPct(row.payInCommission)}</td>
                    <td className={`${colCell}${xh("payOutCommission")}${xv("payOutCommission")}`}>{fmtPct(row.payOutCommission)}</td>
                    <td className={`${colCell}${xh("referralCommission")}${xv("referralCommission")}`}>{fmtPct(row.referralCommission)}</td>

                    {/* Actions — same label-from-behind + sibling shift as Financial Statistics toolbar */}
                    <td className={`${colCell} ${colActions}${xh("actions")}${xv("actions")}`}>
                      <div
                        className="relative flex items-center justify-center gap-0.5 mx-auto max-w-full"
                        onMouseLeave={() => {
                          setVendorRowHoveredAction((h) => (h?.rowId === row.id ? null : h));
                        }}
                      >
                        <div
                          className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{
                            transform:
                              rowHover !== null && rowHover.slot === 1
                                ? `translateX(-${vendorRowHoveredSpacePx}px)`
                                : "translateX(0px)",
                          }}
                          onMouseEnter={() => setVendorRowHoveredAction({ rowId: row.id, slot: 0 })}
                        >
                          <button
                            type="button"
                            aria-label="View"
                            onClick={() => router.push(`/agent/${row.id}`)}
                            className="relative z-10 flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <span
                            className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 z-20 w-fit whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-200 shadow-sm text-right transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-x-0`}
                          >
                            View
                          </span>
                        </div>
                        <div
                          className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{ transform: "translateX(0px)" }}
                          onMouseEnter={() => setVendorRowHoveredAction({ rowId: row.id, slot: 1 })}
                        >
                          <button
                            type="button"
                            aria-label="Remove"
                            className="relative z-10 flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setRemoveConfirmVendorId(row.id);
                            }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <span
                            className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 z-20 w-fit whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-200 shadow-sm text-right transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-x-0`}
                          >
                            Remove
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={Math.max(1, visibleColCount)} className="py-12 text-center text-sm text-gray-400">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-300">{rows.length}</span> results
          </p>
        </div>
      </div>

      {removeConfirmVendorId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-vendor-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
            aria-label="Dismiss"
            onClick={() => setRemoveConfirmVendorId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 id="remove-vendor-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Remove vendor?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This will remove{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {rows.find((r) => r.id === removeConfirmVendorId)?.name ?? "this vendor"}
              </span>{" "}
              from the financial statistics table. You can refresh the page to restore mock data.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveConfirmVendorId(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveVendor}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
