import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export interface AgentPerformanceRow {
  agentName: string;
  totalTransactions: number;
  totalAmount: string;
  completed: string;
  completionRate: string;
  avgProcessingTime: string;
}

export default function AgentPerformanceTable({ rows }: { rows: AgentPerformanceRow[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Vendor Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Vendor</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Transactions</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Completed</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Completion Rate</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Avg Processing Time</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <TableRow key={row.agentName} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                <TableCell className="px-5 py-3 text-sm font-medium text-brand-600 dark:text-brand-400">{row.agentName}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.totalTransactions}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.totalAmount}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.completed}</TableCell>
                <TableCell className="px-5 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      row.completionRate === "0%"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    {row.completionRate}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.avgProcessingTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
