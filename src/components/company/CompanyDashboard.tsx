"use client";

import React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { PieChartIcon } from "@/icons";

type SummaryCard = { title: string; value: string; sub: string };
type TxnRow = {
  transactionId: string;
  date: string;
  type: "PAYIN" | "PAYOUT";
  amount: string;
  method: string;
  utr: string;
  status: "EXPIRED" | "APPROVED" | "PENDING";
};

const cards: SummaryCard[] = [
  { title: "Total Payin Operations", value: "2", sub: "Operations ( Today )" },
  { title: "Total Payout Operations", value: "0", sub: "Operations ( Today )" },
  { title: "Total Payin", value: "₹0", sub: "Total Amount" },
  { title: "Total PayOut", value: "₹0", sub: "Total Amount" },
  { title: "Success Rate", value: "0%", sub: "Success Rate ( today )" },
];

const rows: TxnRow[] = [
  { transactionId: "EX1177850329469152", date: "2026-05-11 01:11 PM", type: "PAYIN", amount: "₹1K", method: "UPI", utr: "Not Provided", status: "EXPIRED" },
  { transactionId: "EX11778943450877473", date: "2026-05-11 03:27 PM", type: "PAYIN", amount: "₹1K", method: "UPI", utr: "Not Provided", status: "EXPIRED" },
  { transactionId: "EX11778148206529376", date: "2026-05-07 02:05 PM", type: "PAYIN", amount: "₹12,13,12", method: "UPI", utr: "Not Provided", status: "EXPIRED" },
  { transactionId: "EX1177814764362937", date: "2026-05-07 02:52 PM", type: "PAYIN", amount: "₹123", method: "UPI", utr: "Not Provided", status: "EXPIRED" },
];

const statusStyles: Record<TxnRow["status"], string> = {
  EXPIRED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  APPROVED: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
};

function OverviewCard({ card }: { card: SummaryCard }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
      <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{card.sub}</p>
    </div>
  );
}

export default function CompanyDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <PieChartIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold">Company Dashboard</h1>
        </div>
        <Link href="/company-settings" className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-600 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
          Payment QR Link
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <OverviewCard key={card.title} card={card} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Recent Transactions</h3>
          <input
            type="text"
            placeholder="Search txn ID, UTR..."
            className="h-9 min-w-[230px] rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/2">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Transaction ID</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Date</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Type</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Amount</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Payment Method</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">UTR / Ref</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <TableRow key={row.transactionId} className="hover:bg-gray-50/60 dark:hover:bg-white/2">
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{row.transactionId}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{row.date}</TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{row.type}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{row.amount}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{row.method}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{row.utr}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <button className="rounded-md border border-brand-200 px-2 py-1 text-brand-500 dark:border-brand-800 dark:text-brand-300">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
