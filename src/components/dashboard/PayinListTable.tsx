"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import DateRangePicker, { DateRange } from "./DateRangePicker";
import { csvExportTimestamp, downloadCsv } from "@/lib/csv-download";

interface PayinRow {
  id: number;
  name: string;
  totalAmount: number;
  fee: number;
  tax: number;
  netAmount: number;
  successAmount: number;
  failedAmount: number;
  successCount: number;
  failedCount: number;
  totalCount: number;
}

const tableData: PayinRow[] = [];

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_OPTIONS = ["All", "Success", "Failed", "Pending"];

export default function PayinListTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [rows, setRows] = useState<PayinRow[]>(tableData);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { loading: authLoading } = useAuth();
  useEffect(() => {
    let mounted = true;
    if (authLoading) return;
    (async () => {
      try {
        const res = await fetch("/api/agent/staff", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          payment_methods?: Array<{
            id: string;
            fullname: string;
            gateway: string;
            financial?: {
              totalPayIn: number;
              successPayIn: number;
              failedPayIn: number;
            };
          }>;
        };
        if (!mounted || !data.ok || !data.payment_methods) return;

        const mapped = data.payment_methods.map((s, i) => {
          const total = s.financial?.totalPayIn ?? 0;
          const success = s.financial?.successPayIn ?? 0;
          const failed = s.financial?.failedPayIn ?? 0;
          const fee = total * 0.01;
          const tax = fee * 0.18;
          return {
            id: i + 1,
            name: `${s.fullname || "Payment Method"} (${s.gateway})`,
            totalAmount: total,
            fee,
            tax,
            netAmount: total - fee - tax,
            successAmount: success,
            failedAmount: failed,
            successCount: success > 0 ? 1 : 0,
            failedCount: failed > 0 ? 1 : 0,
            totalCount: total > 0 ? 1 : 0,
          };
        });
        setRows(mapped);
      } catch {
        setLoadError("Could not load live payin listing.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authLoading]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (!row.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (status === "Success" && row.successAmount <= 0) return false;
        if (status === "Failed" && row.failedAmount <= 0) return false;
        if (status === "Pending" && row.totalAmount <= 0) return false;
        return true;
      }),
    [rows, search, status],
  );

  const exportPayinListingCsv = useCallback(() => {
    const headers = [
      "#",
      "Gateway / Bank",
      "Total Amount",
      "Fee",
      "Tax",
      "Net Amount",
      "Success Amt",
      "Failed Amt",
      "Success",
      "Failed",
      "Total",
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.name,
      r.totalAmount,
      r.fee,
      r.tax,
      r.netAmount,
      r.successAmount,
      r.failedAmount,
      r.successCount,
      r.failedCount,
      r.totalCount,
    ]);
    downloadCsv(`payin-listing-${csvExportTimestamp()}.csv`, [headers, ...rows]);
  }, [filtered]);

  const totals = filtered.reduce(
    (acc, r) => ({
      totalAmount: acc.totalAmount + r.totalAmount,
      fee: acc.fee + r.fee,
      tax: acc.tax + r.tax,
      netAmount: acc.netAmount + r.netAmount,
      successAmount: acc.successAmount + r.successAmount,
      failedAmount: acc.failedAmount + r.failedAmount,
      successCount: acc.successCount + r.successCount,
      failedCount: acc.failedCount + r.failedCount,
      totalCount: acc.totalCount + r.totalCount,
    }),
    { totalAmount: 0, fee: 0, tax: 0, netAmount: 0, successAmount: 0, failedAmount: 0, successCount: 0, failedCount: 0, totalCount: 0 }
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Payin Listing
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">All payment gateway transactions</p>
          {loadError && <p className="text-xs text-amber-600 mt-0.5">{loadError}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gateway..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 w-44"
            />
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  status === s
                    ? "bg-white shadow text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Date range picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Export button */}
          <button
            type="button"
            onClick={exportPayinListingCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Active date range chip */}
      {dateRange && (
        <div className="flex items-center gap-2 px-5 pb-3 sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateRange.label ?? `${dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </span>
          <button
            onClick={() => setDateRange(null)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
            <TableRow>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">#</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">Gateway / Bank</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Total Amount</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Fee</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Tax</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Net Amount</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-green-600 dark:text-green-500 text-right whitespace-nowrap">Success Amt</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-red-500 dark:text-red-400 text-right whitespace-nowrap">Failed Amt</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-green-600 dark:text-green-500 text-right whitespace-nowrap">Success</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-red-500 dark:text-red-400 text-right whitespace-nowrap">Failed</TableCell>
              <TableCell isHeader className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Total</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="py-3 px-4 text-xs text-gray-400">{row.id}</TableCell>
                <TableCell className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.name}</span>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">{fmt(row.totalAmount)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">{fmt(row.fee)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">{fmt(row.tax)}</TableCell>
                <TableCell className="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">{fmt(row.netAmount)}</TableCell>
                <TableCell className="py-3 px-4 text-sm font-medium text-green-600 dark:text-green-400 text-right whitespace-nowrap">{fmt(row.successAmount)}</TableCell>
                <TableCell className="py-3 px-4 text-sm font-medium text-red-500 dark:text-red-400 text-right whitespace-nowrap">{fmt(row.failedAmount)}</TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-full px-2 py-0.5">{row.successCount}</span>
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-full px-2 py-0.5">{row.failedCount}</span>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-white text-right">{row.totalCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] px-4 py-3">
        <div className="overflow-x-auto">
          <div className="min-w-max grid grid-cols-11 gap-0 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <div className="px-4 py-1 col-span-2 text-gray-500">Totals ({filtered.length} gateways)</div>
            <div className="px-4 py-1 text-right">{fmt(totals.totalAmount)}</div>
            <div className="px-4 py-1 text-right text-gray-500">{fmt(totals.fee)}</div>
            <div className="px-4 py-1 text-right text-gray-500">{fmt(totals.tax)}</div>
            <div className="px-4 py-1 text-right">{fmt(totals.netAmount)}</div>
            <div className="px-4 py-1 text-right text-green-600">{fmt(totals.successAmount)}</div>
            <div className="px-4 py-1 text-right text-red-500">{fmt(totals.failedAmount)}</div>
            <div className="px-4 py-1 text-right text-green-600">{totals.successCount}</div>
            <div className="px-4 py-1 text-right text-red-500">{totals.failedCount}</div>
            <div className="px-4 py-1 text-right">{totals.totalCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
