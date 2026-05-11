import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface SummaryRow {
  label: string;
  today: number;
  yesterday: number;
  week: number;
  month: number;
  isAmount?: boolean;
}

const summaryData: SummaryRow[] = [
  { label: "Total Transactions", today: 84, yesterday: 76, week: 498, month: 1284, isAmount: false },
  { label: "Total Amount (₹)", today: 3245670, yesterday: 2987450, week: 18765430, month: 45236789, isAmount: true },
  { label: "Success Count", today: 78, yesterday: 71, week: 462, month: 1196, isAmount: false },
  { label: "Failed Count", today: 6, yesterday: 5, week: 36, month: 88, isAmount: false },
  { label: "Success Amount (₹)", today: 3012340, yesterday: 2756890, week: 17456780, month: 41894250, isAmount: true },
  { label: "Failed Amount (₹)", today: 233330, yesterday: 230560, week: 1308650, month: 3342539, isAmount: true },
  { label: "Net Settlement (₹)", today: 2948694, yesterday: 2701752, week: 17107244, month: 40977422, isAmount: true },
  { label: "Total Fee Collected (₹)", today: 30123, yesterday: 27568, week: 174567, month: 452367, isAmount: true },
];

const fmt = (n: number, isAmount: boolean) =>
  isAmount
    ? "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : n.toLocaleString("en-IN");

const pct = (current: number, prev: number) => {
  if (prev === 0) return null;
  const diff = ((current - prev) / prev) * 100;
  return diff;
};

export default function SummaryTable() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Performance Summary
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">Comparison across time periods</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
            <TableRow>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-left">Metric</TableCell>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Today</TableCell>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Yesterday</TableCell>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">This Week</TableCell>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">This Month</TableCell>
              <TableCell isHeader className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">vs Yesterday</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {summaryData.map((row) => {
              const change = pct(row.today, row.yesterday);
              return (
                <TableRow key={row.label} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3 px-5 text-sm font-medium text-gray-700 dark:text-gray-300">{row.label}</TableCell>
                  <TableCell className="py-3 px-5 text-sm text-gray-800 dark:text-white font-semibold text-right whitespace-nowrap">
                    {fmt(row.today, row.isAmount ?? false)}
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">
                    {fmt(row.yesterday, row.isAmount ?? false)}
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">
                    {fmt(row.week, row.isAmount ?? false)}
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">
                    {fmt(row.month, row.isAmount ?? false)}
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    {change !== null && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          change >= 0
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
