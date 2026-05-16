import Link from "next/link";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "../ui/Pagination";
import { useState, useMemo, useEffect } from "react";

export interface AgentPerformanceRow {
  agentName: string;
  agentId: string | null;
  totalTransactions: number;
  totalAmount: string;
  completed: string;
  completionRate: string;
  avgProcessingTime: string;
}

export default function AgentPerformanceTable({ rows }: { rows: AgentPerformanceRow[] }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

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
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-6 text-sm text-gray-400">Data not available</TableCell>
                <TableCell className="px-5 py-6 text-sm text-gray-400">-</TableCell>
                <TableCell className="px-5 py-6 text-sm text-gray-400">-</TableCell>
                <TableCell className="px-5 py-6 text-sm text-gray-400">-</TableCell>
                <TableCell className="px-5 py-6 text-sm text-gray-400">-</TableCell>
                <TableCell className="px-5 py-6 text-sm text-gray-400">-</TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={`${row.agentId ?? "na"}-${row.agentName}`} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-5 py-3 text-sm font-medium text-brand-600 dark:text-brand-400">
                    {row.agentId ? (
                      <Link href={`/agent/${row.agentId}`} className="hover:underline">
                        {row.agentName}
                      </Link>
                    ) : (
                      row.agentName
                    )}
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-400 shrink-0">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} entries
          </p>
          <Pagination
            total={rows.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
