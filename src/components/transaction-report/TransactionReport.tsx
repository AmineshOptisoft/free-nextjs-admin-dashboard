"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  TransactionSummaryCards,
  TransactionStatisticsPanels,
  AgentPerformanceTable,
  TransactionStatusDistributionTable,
  type TransactionSummaryCard,
  type TransactionStatBlock,
  type AgentPerformanceRow,
  type TransactionStatusDistributionRow,
} from ".";
import { GrTransaction } from "react-icons/gr";

type Tx = {
  id: string;
  amount: number;
  status: string;
  assignedAgentName?: string;
  assignedAgentId?: string | null;
  /** Company payin/payout list uses this label; keep in sync for vendor performance. */
  assignedToLabel?: string;
};



function inr(v: number): string {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function aggregateByStatus(payIns: Tx[], payOuts: Tx[]): TransactionStatusDistributionRow[] {
  const map = new Map<string, { payInCount: number; payInAmount: number; payOutCount: number; payOutAmount: number }>();
  for (const t of payIns) {
    const s = (t.status || "UNKNOWN").toUpperCase();
    const row = map.get(s) ?? { payInCount: 0, payInAmount: 0, payOutCount: 0, payOutAmount: 0 };
    row.payInCount += 1;
    row.payInAmount += t.amount || 0;
    map.set(s, row);
  }
  for (const t of payOuts) {
    const s = (t.status || "UNKNOWN").toUpperCase();
    const row = map.get(s) ?? { payInCount: 0, payInAmount: 0, payOutCount: 0, payOutAmount: 0 };
    row.payOutCount += 1;
    row.payOutAmount += t.amount || 0;
    map.set(s, row);
  }
  return Array.from(map.entries()).map(([status, r]) => ({
    status,
    payInCount: r.payInCount,
    payInAmount: inr(r.payInAmount),
    payOutCount: r.payOutCount,
    payOutAmount: inr(r.payOutAmount),
    totalCount: r.payInCount + r.payOutCount,
    totalAmount: inr(r.payInAmount + r.payOutAmount),
  }));
}

type ApiResponse = { ok?: boolean; payins?: Tx[]; payouts?: Tx[]; error?: string };
type MeResponse = { ok?: boolean; role?: "admin" | "agent" | "company" };

export default function TransactionReport() {
  const [payIns, setPayIns] = useState<Tx[]>([]);
  const [payOuts, setPayOuts] = useState<Tx[]>([]);
  const [role, setRole] = useState<"admin" | "agent" | "company">("admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const me = (await meRes.json()) as MeResponse;
        const currentRole: "admin" | "agent" | "company" = me.ok && me.role ? me.role : "admin";
        if (!mounted) return;
        setRole(currentRole);

        if (currentRole === "admin") {
          const res = await fetch("/api/admin/transaction-report?limit=5000", { credentials: "include" });
          const data = (await res.json()) as ApiResponse;
          if (!res.ok || !data.ok) {
            setError(data.error ?? "Could not load report data.");
            return;
          }
          setPayIns(data.payins ?? []);
          setPayOuts(data.payouts ?? []);
        } else {
          const [piRes, poRes] = await Promise.all([
            fetch("/api/company/payins?limit=500", { credentials: "include" }),
            fetch("/api/company/payouts?limit=500", { credentials: "include" }),
          ]);
          const pi = (await piRes.json()) as ApiResponse;
          const po = (await poRes.json()) as ApiResponse;
          if (!piRes.ok || !poRes.ok || !pi.ok || !po.ok) {
            setError(pi.error ?? po.error ?? "Could not load report data.");
            return;
          }
          setPayIns(pi.payins ?? []);
          setPayOuts(po.payouts ?? []);
        }
      } catch {
        if (mounted) setError("Network error.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const all = [...payIns, ...payOuts];
    const completed = all.filter((t) => {
      const s = t.status.toUpperCase();
      return s === "APPROVED" || s === "APPROVED_BY_ADMIN" || s === "APPROVED_BY_AGENT";
    });
    const totalVolume = all.reduce((s, t) => s + (t.amount || 0), 0);
    const completedVolume = completed.reduce((s, t) => s + (t.amount || 0), 0);
    const completionRate = all.length ? ((completed.length / all.length) * 100).toFixed(2) : "0.00";
    const avg = all.length ? totalVolume / all.length : 0;
    const piVolume = payIns.reduce((s, t) => s + (t.amount || 0), 0);
    const poVolume = payOuts.reduce((s, t) => s + (t.amount || 0), 0);
    return { all, completed, totalVolume, completedVolume, completionRate, avg, piVolume, poVolume };
  }, [payIns, payOuts]);

  const agentPerformanceRows: AgentPerformanceRow[] = useMemo(() => {
    const all = [...payIns, ...payOuts];
    const grouped = new Map<
      string,
      {
        agentId: string | null;
        totalTransactions: number;
        totalAmount: number;
        completedAmount: number;
        completedCount: number;
      }
    >();
    for (const t of all) {
      const key = (t.assignedAgentName ?? t.assignedToLabel ?? "").trim();
      if (!key || key === "—" || key.toLowerCase() === "unassigned" || key.toLowerCase() === "overall") continue;
      const aid = t.assignedAgentId ? String(t.assignedAgentId) : null;
      const row = grouped.get(key) ?? {
        agentId: aid,
        totalTransactions: 0,
        totalAmount: 0,
        completedAmount: 0,
        completedCount: 0,
      };
      if (!row.agentId && aid) row.agentId = aid;
      row.totalTransactions += 1;
      row.totalAmount += t.amount || 0;
      const s = (t.status || "").toUpperCase();
      if (s.includes("APPROVED")) {
        row.completedCount += 1;
        row.completedAmount += t.amount || 0;
      }
      grouped.set(key, row);
    }
    const rows = Array.from(grouped.entries()).map(([agentName, r]) => ({
      agentName,
      agentId: r.agentId,
      totalTransactions: r.totalTransactions,
      totalAmount: inr(r.totalAmount),
      completed: inr(r.completedAmount),
      completionRate: `${r.totalTransactions ? ((r.completedCount / r.totalTransactions) * 100).toFixed(2) : "0.00"}%`,
      avgProcessingTime: "—",
    }));
    return rows;
  }, [payIns, payOuts]);

  const summaryCards: TransactionSummaryCard[] = [
    { title: "Total Transactions", value: String(totals.all.length), accent: "blue", icon: <span /> },
    { title: "PayIn Transactions", value: String(payIns.length), accent: "green", icon: <span /> },
    { title: "PayOut Transactions", value: String(payOuts.length), accent: "warning", icon: <span /> },
    { title: "Avg. Completion Rate", value: `${totals.completionRate}%`, accent: "teal", icon: <span /> },
  ];

  const statBlocks: TransactionStatBlock[] = [
    {
      title: "Pay-In Statistics",
      rows: [
        { label: "Total Transactions", value: String(payIns.length) },
        { label: "Total Volume", value: inr(totals.piVolume) },
        {
          label: "Completion Rate",
          value: `${(
            payIns.length
              ? (payIns.filter((t) => t.status.toUpperCase().includes("APPROVED")).length / payIns.length) * 100
              : 0
          ).toFixed(2)}%`,
        },
        { label: "Average Transaction", value: inr(payIns.length ? totals.piVolume / payIns.length : 0) },
        { label: "Average Processing Time", value: "—" },
      ],
    },
    {
      title: "Pay-Out Statistics",
      rows: [
        { label: "Total Transactions", value: String(payOuts.length) },
        { label: "Total Volume", value: inr(totals.poVolume) },
        {
          label: "Completion Rate",
          value: `${(
            payOuts.length
              ? (payOuts.filter((t) => t.status.toUpperCase().includes("APPROVED")).length / payOuts.length) * 100
              : 0
          ).toFixed(2)}%`,
        },
        { label: "Average Transaction", value: inr(payOuts.length ? totals.poVolume / payOuts.length : 0) },
        { label: "Average Processing Time", value: "—" },
      ],
    },
  ];

  const statusDistributionRows = aggregateByStatus(payIns, payOuts);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <GrTransaction className="w-6 h-6" />
        <h1 className="text-xl font-bold">Transaction Report</h1>
      </div>
      <p className="text-xs text-purple-600 dark:text-purple-400">
        {role === "admin" ? "Live admin-wide data" : "Live company-only data"}
      </p>

      {loading && <div className="text-sm text-gray-500">Loading report data...</div>}
      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</div>}
      <TransactionSummaryCards cards={summaryCards} />
      <TransactionStatisticsPanels blocks={statBlocks} />
      <AgentPerformanceTable rows={agentPerformanceRows} />
      <TransactionStatusDistributionTable rows={statusDistributionRows} />
    </div>
  );
}