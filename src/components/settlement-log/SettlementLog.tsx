"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { SettlementLogIcon } from "@/icons/nav-icons";

interface SettlementRecord {
  settlementDate: string;
  subAdmin: string;
  type: "Credit" | "Debit";
  amount: string;
  remarks: string;
}

const records: SettlementRecord[] = [
  {
    settlementDate: "11/05/2026",
    subAdmin: "Bablu0012",
    type: "Credit",
    amount: "₹12,500",
    remarks: "Manual settlement posted",
  },
  {
    settlementDate: "11/05/2026",
    subAdmin: "sachin80",
    type: "Debit",
    amount: "₹2,500",
    remarks: "Adjustment against payout mismatch",
  },
];

export default function SettlementLog() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <SettlementLogIcon />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settlement Logs</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[150px]">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                From
              </label>
              <input
                type="date"
                defaultValue="2026-05-05"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
              />
            </div>
            <div className="min-w-[150px]">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                To
              </label>
              <input
                type="date"
                defaultValue="2026-05-11"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-xs font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600">
              Add Settlement
            </button>
            <select className="h-10 min-w-[170px] rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200">
              <option>Select Subadmin</option>
              <option>Bablu0012</option>
              <option>sachin80</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Settlement Records ({records.length} records)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Settlement Date</TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Subadmin</TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Type</TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Amount</TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Remarks</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {records.map((record, index) => (
                <TableRow key={`${record.subAdmin}-${index}`} className="hover:bg-gray-50/60 dark:hover:bg-white/2">
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{record.settlementDate}</TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{record.subAdmin}</TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        record.type === "Credit"
                          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {record.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{record.amount}</TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{record.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
