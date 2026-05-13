"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  color: "blue" | "green" | "red" | "purple";
  icon: React.ReactNode;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    value: "text-green-700 dark:text-green-300",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-500 dark:text-red-400",
    value: "text-red-600 dark:text-red-300",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
    value: "text-purple-700 dark:text-purple-300",
  },
};

function MetricCard({ title, value, subValue, change, color, icon }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.bg}`}>
        <span className={`${c.icon}`}>{icon}</span>
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className={`mt-1 text-2xl font-bold ${c.value}`}>{value}</h4>
        {subValue && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subValue}</p>
        )}
        {change !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardMetrics() {
  const [data, setData] = useState<{
    total_payin_amount: number;
    success_payin_amount: number;
    failed_payin_amount: number;
    net_settlement: number;
    payin_txn_count: number;
    payin_success_count: number;
    payin_failed_count: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/agent/dashboard", { credentials: "include" });
        const json = (await res.json()) as { ok?: boolean; metrics?: typeof data };
        if (!mounted || !res.ok || !json.ok || !json.metrics) return;
        setData(json.metrics);
      } catch {
        // keep fallback values
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalPayIn = data?.total_payin_amount ?? 0;
  const successPayIn = data?.success_payin_amount ?? 0;
  const failedPayIn = data?.failed_payin_amount ?? 0;
  const netSettlement = data?.net_settlement ?? 0;
  const payinTxnCount = data?.payin_txn_count ?? 0;
  const payinSuccessCount = data?.payin_success_count ?? 0;
  const payinFailedCount = data?.payin_failed_count ?? 0;
  const money = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <MetricCard
        title="Total Pay In Amount"
        value={money(totalPayIn)}
        subValue={`${payinTxnCount.toLocaleString("en-IN")} transactions`}
        change={undefined}
        color="blue"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <MetricCard
        title="Success Amount"
        value={money(successPayIn)}
        subValue={`${payinSuccessCount.toLocaleString("en-IN")} successful`}
        change={undefined}
        color="green"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <MetricCard
        title="Failed Amount"
        value={money(failedPayIn)}
        subValue={`${payinFailedCount.toLocaleString("en-IN")} failed`}
        change={undefined}
        color="red"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <MetricCard
        title="Net Settlement"
        value={money(netSettlement)}
        subValue="After fees & taxes"
        change={undefined}
        color="purple"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}
