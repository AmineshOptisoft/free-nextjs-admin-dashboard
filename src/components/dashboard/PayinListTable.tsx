"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import DateRangePicker, { DateRange } from "./DateRangePicker";

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

const tableData: PayinRow[] = [
  { id: 1, name: "Axis Bank UPI", totalAmount: 4523678, fee: 45236, tax: 8142, netAmount: 4470300, successAmount: 4280450, failedAmount: 243228, successCount: 312, failedCount: 18, totalCount: 330 },
  { id: 2, name: "HDFC UPI", totalAmount: 3812450, fee: 38124, tax: 6862, netAmount: 3767464, successAmount: 3650230, failedAmount: 162220, successCount: 278, failedCount: 12, totalCount: 290 },
  { id: 3, name: "ICICI UPI", totalAmount: 2956780, fee: 29567, tax: 5322, netAmount: 2921891, successAmount: 2810450, failedAmount: 146330, successCount: 215, failedCount: 11, totalCount: 226 },
  { id: 4, name: "SBI UPI", totalAmount: 2345600, fee: 23456, tax: 4222, netAmount: 2317922, successAmount: 2210340, failedAmount: 135260, successCount: 180, failedCount: 10, totalCount: 190 },
  { id: 5, name: "Kotak UPI", totalAmount: 1987650, fee: 19876, tax: 3577, netAmount: 1964197, successAmount: 1890440, failedAmount: 97210, successCount: 152, failedCount: 8, totalCount: 160 },
  { id: 6, name: "Yes Bank UPI", totalAmount: 1654320, fee: 16543, tax: 2977, netAmount: 1634800, successAmount: 1560780, failedAmount: 93540, successCount: 128, failedCount: 7, totalCount: 135 },
  { id: 7, name: "Punjab National Bank", totalAmount: 1423560, fee: 14235, tax: 2562, netAmount: 1406763, successAmount: 1340250, failedAmount: 83310, successCount: 110, failedCount: 6, totalCount: 116 },
  { id: 8, name: "Bank of Baroda", totalAmount: 1234780, fee: 12347, tax: 2222, netAmount: 1220211, successAmount: 1165430, failedAmount: 69350, successCount: 96, failedCount: 5, totalCount: 101 },
  { id: 9, name: "Canara Bank", totalAmount: 1087650, fee: 10876, tax: 1957, netAmount: 1074817, successAmount: 1020340, failedAmount: 67310, successCount: 84, failedCount: 5, totalCount: 89 },
  { id: 10, name: "Union Bank UPI", totalAmount: 987430, fee: 9874, tax: 1777, netAmount: 975779, successAmount: 930450, failedAmount: 56980, successCount: 76, failedCount: 4, totalCount: 80 },
  { id: 11, name: "Indian Bank", totalAmount: 876540, fee: 8765, tax: 1577, netAmount: 866198, successAmount: 820430, failedAmount: 56110, successCount: 68, failedCount: 4, totalCount: 72 },
  { id: 12, name: "Central Bank", totalAmount: 765430, fee: 7654, tax: 1377, netAmount: 756399, successAmount: 718340, failedAmount: 47090, successCount: 59, failedCount: 3, totalCount: 62 },
  { id: 13, name: "UCO Bank", totalAmount: 654320, fee: 6543, tax: 1177, netAmount: 646600, successAmount: 612430, failedAmount: 41890, successCount: 51, failedCount: 3, totalCount: 54 },
  { id: 14, name: "Bank of India", totalAmount: 543210, fee: 5432, tax: 977, netAmount: 536801, successAmount: 508340, failedAmount: 34870, successCount: 42, failedCount: 2, totalCount: 44 },
  { id: 15, name: "Indian Overseas Bank", totalAmount: 487650, fee: 4876, tax: 877, netAmount: 481897, successAmount: 456340, failedAmount: 31310, successCount: 38, failedCount: 2, totalCount: 40 },
  { id: 16, name: "Paytm Payments Bank", totalAmount: 1876540, fee: 18765, tax: 3377, netAmount: 1854398, successAmount: 1780430, failedAmount: 96110, successCount: 145, failedCount: 8, totalCount: 153 },
  { id: 17, name: "PhonePe UPI", totalAmount: 3245670, fee: 32456, tax: 5842, netAmount: 3207372, successAmount: 3090450, failedAmount: 155220, successCount: 250, failedCount: 13, totalCount: 263 },
  { id: 18, name: "Google Pay", totalAmount: 2987650, fee: 29876, tax: 5377, netAmount: 2952397, successAmount: 2840430, failedAmount: 147220, successCount: 230, failedCount: 12, totalCount: 242 },
  { id: 19, name: "Amazon Pay", totalAmount: 876540, fee: 8765, tax: 1577, netAmount: 866198, successAmount: 820340, failedAmount: 56200, successCount: 68, failedCount: 4, totalCount: 72 },
  { id: 20, name: "BHIM UPI", totalAmount: 654320, fee: 6543, tax: 1177, netAmount: 646600, successAmount: 614320, failedAmount: 40000, successCount: 51, failedCount: 3, totalCount: 54 },
];

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_OPTIONS = ["All", "Success", "Failed", "Pending"];

export default function PayinListTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const filtered = tableData.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
