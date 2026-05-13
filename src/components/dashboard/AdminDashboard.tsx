"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  commission: number;
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
        title="Edit credit"
        onClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        className="pointer-events-none inline-flex shrink-0 items-center justify-center rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-brand-600 group-hover/credit:pointer-events-auto group-hover/credit:opacity-100 dark:hover:bg-gray-800 dark:hover:text-brand-400"
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

const colorVal = (n: number, zeroDash = false) => {
  if (n === 0) return zeroDash ? <span className="text-gray-400">0</span> : <span>0</span>;
  return <span className={n > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{fmt(n)}</span>;
};

const badge = (n: number) => (
  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
    n > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : n < 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
  }`}>{fmt(n)}</span>
);

const colHdr = "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";
const colCell = "px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";

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
      commission: 0,
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
        commission: acc.commission + r.commission,
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

  const tableActions = [
    {
      label: "Sort",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
      )
    },
    {
      label: "Filter",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
      )
    },
    {
      label: "View",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )
    },
    {
      label: "Columns",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 14h4a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 17v-4m6 4v-4M9 7h6" /></svg>
      )
    },
    {
      label: "Search",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      )
    }
  ] as const;

  const filtered = rows.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );
  const hoveredLabelSpacePx =
    hoveredToolbarIndex === null ? 0 : getActionLabelSpace(topActions[hoveredToolbarIndex].label);
  const hoveredTableActionSpacePx =
    hoveredTableActionIndex === null ? 0 : getActionLabelSpace(tableActions[hoveredTableActionIndex].label);

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
                className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: isLeftOfHovered ? `translateX(-${hoveredLabelSpacePx}px)` : "translateX(0px)",
                }}
                onMouseEnter={() => setHoveredToolbarIndex(idx)}
                onMouseLeave={() => setHoveredToolbarIndex(null)}
              >
                <button
                  aria-label={action.label}
                  className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  {action.icon}
                </button>
                <span
                  className={`pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 w-fit whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-200 shadow-sm text-right transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isHovered ? "-translate-x-2 opacity-100" : "translate-x-2 opacity-0"
                  }`}
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
            <div className="relative flex items-center gap-0.5">
              {tableActions.map((action, idx) => {
                const isHovered = hoveredTableActionIndex === idx;
                const isLeftOfHovered = hoveredTableActionIndex !== null && idx < hoveredTableActionIndex;
                return (
                  <div
                    key={action.label}
                    className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: isLeftOfHovered ? `translateX(-${hoveredTableActionSpacePx}px)` : "translateX(0px)",
                    }}
                    onMouseEnter={() => setHoveredTableActionIndex(idx)}
                    onMouseLeave={() => setHoveredTableActionIndex(null)}
                  >
                    <button
                      type="button"
                      aria-label={action.label}
                      title={action.label === "View" ? "Open agents list" : undefined}
                      onClick={() => {
                        if (action.label === "View") router.push("/agent");
                      }}
                      className="relative z-10 flex items-center justify-center w-7 h-7 rounded text-gray-400 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      {action.icon}
                    </button>
                    <span
                      className={`pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 w-fit whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-200 shadow-sm text-right transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isHovered ? "-translate-x-2 opacity-100" : "translate-x-2 opacity-0"
                      }`}
                    >
                      {action.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap pr-1">
              Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> results
            </span>
          </div>
        </div>

        {/* Table (horizontal scroll) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "1600px" }}>
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-gray-800">
                <th className={`${colHdr} sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 min-w-[140px]`}>Vendor</th>
                <th className={colHdr}>Security</th>
                <th className={colHdr}>
                  Manual PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>
                  Approved PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>Discounted</th>
                <th className={colHdr}>Net PayIn</th>
                <th className={colHdr}>Payout</th>
                <th className={colHdr}>Unsettle Payout</th>
                <th className={colHdr}>Settlement</th>
                <th className={colHdr}>
                  Net&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>Prev</th>
                <th className={colHdr}>Commission</th>
                <th className={colHdr}>Running</th>
                <th className={colHdr}>Running Unsettled</th>
                <th className={colHdr}>Credit</th>
                <th className={colHdr}>Final</th>
                <th className={colHdr}>Remaining</th>
                <th className={`${colHdr} text-center`}>Actions</th>
              </tr>

              {/* Totals row */}
              <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-white/[0.04]">
                <td className={`${colCell} sticky left-0 z-10 bg-gray-100 dark:bg-gray-900 font-bold text-gray-600 dark:text-gray-300`}>Vendor</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.security.toLocaleString("en-IN")}</td>
                <td className={colCell}>{totals.manualPayIn}</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.approvedPayIn.toLocaleString("en-IN")}</td>
                <td className={colCell}>{totals.discounted}</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.netPayIn.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-orange-500`}>{totals.payout.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-red-500`}>{fmt(totals.unsettlePayout)}</td>
                <td className={colCell}>{totals.settlement.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-red-500`}>{fmt(totals.net)}</td>
                <td className={colCell}>{totals.prevBalance}</td>
                <td className={`${colCell}`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-600 dark:text-green-400 font-semibold">{totals.commission.toLocaleString("en-IN")}</span>
                  </div>
                </td>
                <td className={colCell}>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{totals.running.toLocaleString("en-IN")}</span>
                </td>
                <td className={colCell}>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{totals.runningUnsettled.toLocaleString("en-IN")}</span>
                </td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.credit.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-green-600 dark:text-green-400`}>{totals.finalBalance.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-green-600 dark:text-green-400`}>{totals.remainingBalance.toLocaleString("en-IN")}</td>
                <td className={colCell}></td>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-blue-50/30 dark:hover:bg-white/[0.015] transition-colors">
                  {/* Vendor name — sticky, links to agent detail */}
                  <td className={`${colCell} sticky left-0 z-10 bg-white dark:bg-gray-900 font-semibold text-gray-800 dark:text-gray-200`}>
                    <Link
                      href={`/agent/${row.id}`}
                      className="text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      {row.name}
                    </Link>
                  </td>

                  <td className={colCell}>{row.security.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.manualPayIn.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.approvedPayIn.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.discounted.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.netPayIn.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.payout.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{colorVal(row.unsettlePayout, true)}</td>
                  <td className={colCell}>{colorVal(row.settlement, true)}</td>
                  <td className={colCell}>{colorVal(row.net, true)}</td>
                  <td className={colCell}>{row.prevBalance.toLocaleString("en-IN")}</td>
                  <td className={colCell}>{row.commission.toLocaleString("en-IN")}</td>

                  {/* Running — badge */}
                  <td className={colCell}>
                    {badge(row.running)}
                  </td>

                  {/* Running Unsettled — badge */}
                  <td className={colCell}>
                    {badge(row.runningUnsettled)}
                  </td>

                  <td className={colCell}>
                    <EditableCreditCell rowId={row.id} value={row.credit} onSave={saveRowCredit} />
                  </td>

                  {/* Final Balance */}
                  <td className={colCell}>{colorVal(row.finalBalance, true)}</td>

                  {/* Remaining Balance */}
                  <td className={colCell}>{colorVal(row.remainingBalance, true)}</td>

                  {/* Actions — View agent; remove not wired */}
                  <td className={`${colCell} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/agent/${row.id}`}
                        title="View agent"
                        className="flex items-center justify-center w-6 h-6 rounded text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        disabled
                        title="Remove (coming soon)"
                        className="flex cursor-not-allowed items-center justify-center w-6 h-6 rounded text-gray-300 opacity-50 dark:text-gray-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-sm text-gray-400">No vendors found.</td>
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
    </div>
  );
}
