import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export interface TransactionStatusDistributionRow {
  payInCount: number;
  payInAmount: string;
  payOutCount: number;
  payOutAmount: string;
  status: string;
  totalCount: number;
  totalAmount: string;
}

function statusStyle(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("APPROVED")) return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (s.includes("EXPIRED") || s.includes("REJECTED") || s.includes("REVOKED"))
    return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
  if (s.includes("ASSIGN")) return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
  return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
}

export default function TransactionStatusDistributionTable({
  rows,
}: {
  rows: TransactionStatusDistributionRow[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Transaction Status Distribution
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Pay-In Count</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Pay-In Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Pay-Out Count</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Pay-Out Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Count</TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Amount</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row, idx) => (
              <TableRow key={`${row.status}-${idx}`} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.payInCount}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.payInAmount}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.payOutCount}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.payOutAmount}</TableCell>
                <TableCell className="px-5 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(row.status)}`}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.totalCount}</TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">{row.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
