"use client";
import React, { useEffect, useMemo, useState } from "react";
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

type Tx = { amount: number; status: string; createdAtIso?: string };

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
  const [payins, setPayins] = useState<Tx[]>([]);
  const [payouts, setPayouts] = useState<Tx[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [inRes, outRes] = await Promise.all([
          fetch("/api/agent/transactions?type=PAYIN&limit=500", { credentials: "include" }),
          fetch("/api/agent/transactions?type=PAYOUT&limit=500", { credentials: "include" }),
        ]);
        const inJson = (await inRes.json()) as { ok?: boolean; items?: Array<{ amount: number; status: string; createdAtIso?: string }> };
        const outJson = (await outRes.json()) as { ok?: boolean; items?: Array<{ amount: number; status: string; createdAtIso?: string }> };
        if (!mounted) return;
        if (inRes.ok && inJson.ok && inJson.items) setPayins(inJson.items);
        if (outRes.ok && outJson.ok && outJson.items) setPayouts(outJson.items);
      } catch {
        // keep empty/fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const summaryData: SummaryRow[] = useMemo(() => {
    const now = new Date();
    const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = dayStart(now).getTime();
    const yday = dayStart(new Date(now.getTime() - 86400000)).getTime();
    const weekStart = dayStart(new Date(now.getTime() - 6 * 86400000)).getTime();
    const monthStart = dayStart(new Date(now.getFullYear(), now.getMonth(), 1)).getTime();

    const toMs = (iso?: string) => {
      if (!iso) return 0;
      const t = new Date(iso).getTime();
      return Number.isFinite(t) ? t : 0;
    };
    const success = (s: string) => s === "APPROVED";
    const failed = (s: string) => s === "EXPIRED" || s === "DECLINED";

    const all = [...payins, ...payouts];
    const sum = (arr: Tx[]) => arr.reduce((a, b) => a + b.amount, 0);
    const countInRange = (arr: Tx[], from: number, to?: number) =>
      arr.filter((x) => {
        const t = toMs(x.createdAtIso);
        if (!t) return false;
        if (to !== undefined) return t >= from && t < to;
        return t >= from;
      });

    const todayAll = countInRange(all, today);
    const yAll = countInRange(all, yday, today);
    const wAll = countInRange(all, weekStart);
    const mAll = countInRange(all, monthStart);

    const sToday = todayAll.filter((x) => success(x.status));
    const sY = yAll.filter((x) => success(x.status));
    const sW = wAll.filter((x) => success(x.status));
    const sM = mAll.filter((x) => success(x.status));

    const fToday = todayAll.filter((x) => failed(x.status));
    const fY = yAll.filter((x) => failed(x.status));
    const fW = wAll.filter((x) => failed(x.status));
    const fM = mAll.filter((x) => failed(x.status));

    const feePct = 0.01;
    return [
      { label: "Total Transactions", today: todayAll.length, yesterday: yAll.length, week: wAll.length, month: mAll.length, isAmount: false },
      { label: "Total Amount (₹)", today: sum(todayAll), yesterday: sum(yAll), week: sum(wAll), month: sum(mAll), isAmount: true },
      { label: "Success Count", today: sToday.length, yesterday: sY.length, week: sW.length, month: sM.length, isAmount: false },
      { label: "Failed Count", today: fToday.length, yesterday: fY.length, week: fW.length, month: fM.length, isAmount: false },
      { label: "Success Amount (₹)", today: sum(sToday), yesterday: sum(sY), week: sum(sW), month: sum(sM), isAmount: true },
      { label: "Failed Amount (₹)", today: sum(fToday), yesterday: sum(fY), week: sum(fW), month: sum(fM), isAmount: true },
      { label: "Net Settlement (₹)", today: sum(sToday), yesterday: sum(sY), week: sum(sW), month: sum(sM), isAmount: true },
      { label: "Total Fee Collected (₹)", today: sum(todayAll) * feePct, yesterday: sum(yAll) * feePct, week: sum(wAll) * feePct, month: sum(mAll) * feePct, isAmount: true },
    ];
  }, [payins, payouts]);

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
