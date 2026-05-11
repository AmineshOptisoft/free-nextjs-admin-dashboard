"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import DateRangePicker, { type DateRange } from "../dashboard/DateRangePicker";
import TableIcon from "../../icons/table.svg";
interface LedgerEntry {
  date: string;
  debit: string;
  credit: string;
  balance: string;
  narrative: string;
}

interface LedgerAccount {
  name: string;
  fromDate: string;
  toDate: string;
  openingBalance: string;
  closingBalance: string;
  entries: LedgerEntry[];
}

const accounts: LedgerAccount[] = [
  {
    name: "Bablu0012",
    fromDate: "05/05/2026",
    toDate: "11/05/2026",
    openingBalance: "-2,977.03 Dr",
    closingBalance: "-0.00",
    entries: [
      { date: "07/05/2026", debit: "3,000.00", credit: "-", balance: "23.00 Cr", narrative: "Pay In" },
      { date: "07/05/2026", debit: "-", credit: "23.00", balance: "0.00", narrative: "Pay Cut" },
    ],
  },
  {
    name: "sachin80",
    fromDate: "05/05/2026",
    toDate: "11/05/2026",
    openingBalance: "0.00",
    closingBalance: "0.00",
    entries: [],
  },
];

export default function LedgerReport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date("2026-05-05"),
    to: new Date("2026-05-11"),
    label: "May 5, 2026 - May 11, 2026",
  });
  const [openAccountIndex, setOpenAccountIndex] = useState(0);

  const parseAmount = (value: string) => {
    if (value === "-") return 0;
    return Number(value.replace(/,/g, ""));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <TableIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ledger Report</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600">
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Filter</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{accounts.length} records found</p>
          </div>
          <select className="h-10 min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200">
            <option>All Subadmins</option>
            <option>Bablu0012</option>
            <option>sachin80</option>
          </select>
        </div>
      </div>

      {accounts.map((account, index) => (
        <div
          key={account.name}
          className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3"
        >
          <button
            type="button"
            onClick={() => setOpenAccountIndex((prev) => (prev === index ? -1 : index))}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
              openAccountIndex === index
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "bg-transparent text-gray-800 hover:bg-gray-50 dark:text-white/90 dark:hover:bg-white/5"
            }`}
          >
            <div>
              <h3 className="text-sm font-semibold">{account.name}</h3>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                From {account.fromDate} to {account.toDate}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Opening Bal.{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{account.openingBalance}</span>
              </p>
              <svg
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                  openAccountIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openAccountIndex === index ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <Table>
                  <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Date</TableCell>
                      <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Debit (Rs.)</TableCell>
                      <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Credit (Rs.)</TableCell>
                      <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Balance (Rs.)</TableCell>
                      <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Short Narrative</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {account.entries.length ? (
                      account.entries.map((entry, entryIndex) => (
                        <TableRow key={`${entry.date}-${entryIndex}`} className="hover:bg-gray-50/60 dark:hover:bg-white/2">
                          <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{entry.date}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{entry.debit}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{entry.credit}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{entry.balance}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{entry.narrative}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="px-4 py-6 text-sm text-gray-400">No ledger entries found.</TableCell>
                        <TableCell className="px-4 py-6 text-sm text-gray-400">-</TableCell>
                        <TableCell className="px-4 py-6 text-sm text-gray-400">-</TableCell>
                        <TableCell className="px-4 py-6 text-sm text-gray-400">-</TableCell>
                        <TableCell className="px-4 py-6 text-sm text-gray-400">-</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-50/80 dark:bg-white/2">
                      <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Total</TableCell>
                      <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {account.entries
                          .reduce((sum, row) => sum + parseAmount(row.debit), 0)
                          .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {account.entries
                          .reduce((sum, row) => sum + parseAmount(row.credit), 0)
                          .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">-</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <p className="mt-3 text-right text-xs text-gray-500 dark:text-gray-400">
                Closing Bal. <span className="font-semibold text-gray-700 dark:text-gray-200">{account.closingBalance}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
