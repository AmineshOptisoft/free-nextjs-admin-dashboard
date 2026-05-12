"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EditAgentModal from "./EditAgentModal";
import Pagination from "../ui/Pagination";
import type { Agent, AgentDetailApi } from "./types";

function statusBadgeClass(s: string) {
  const x = s.toLowerCase();
  if (x === "active") return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
  if (x === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (x === "blocked") return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
  return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
}

function formatAgentDate(v: string | Date | null | undefined): string {
  if (v == null) return "—";
  try {
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function toListAgent(d: AgentDetailApi): Agent {
  return {
    id: d.id,
    fullname: d.fullname,
    username: d.username,
    email: d.email,
    security_deposit: d.security_deposit,
    credit_limit: d.credit_limit,
    net_pay_in: d.net_pay_in,
    net_pay_out: d.net_pay_out,
    pay_in_commission: d.pay_in_commission,
    pay_out_commission: d.pay_out_commission,
    referral_commission: d.referral_commission,
    status: d.status,
  };
}

/** Maps DB agent row to the legacy detail layout fields. */
function mapApiToView(a: AgentDetailApi) {
  const net = a.net_pay_in - a.net_pay_out;
  const statusOnline = a.status === "active";
  return {
    id: a.id,
    username: a.username,
    displayName: a.fullname || a.username,
    parent: "—",
    rawStatus: a.status,
    status: statusOnline ? ("online" as const) : ("offline" as const),
    whatsapp: a.email || "N/A",
    currentUsage: 0,
    securityDeposit: a.security_deposit,
    creditLimit: a.credit_limit,
    net,
    prevLastRunning: a.previous_balance,
    runningToday: a.running_balance,
    final: a.running_balance - a.security_deposit,
    remainingBalance: Math.max(0, Math.abs(a.running_balance)),
    payinCommission: `${a.pay_in_commission}%`,
    payoutCommission: `${a.pay_out_commission}%`,
    referralCommission: `${a.referral_commission}%`,
    referralCode: "—",
    accountCreated: formatAgentDate(a.created_at),
    settlementAmount: a.settlement_amount,
    perf: {
      successRate: 0,
      totalVolume: a.net_pay_in,
      today: a.running_balance,
      thisWeek: a.net_pay_in,
    },
  };
}

type ActivityStatus = "EXPIRED" | "APPROVED" | "PENDING" | "PROCESSING" | "FAILED";
type ActivityType   = "PAYIN" | "PAYOUT";
interface Activity {
  id: string; date: string; orderId: string; type: ActivityType; amount: number; status: ActivityStatus;
}

function getMockActivity(agentId: string): Activity[] {
  const base = parseInt(agentId) * 1000;
  return [
    { id:"1", date:"5/8/2026", orderId:`EXT${base}177823454545518338`, type:"PAYIN",  amount:5000,  status:"EXPIRED" },
    { id:"2", date:"5/8/2026", orderId:`EXT${base}177823418578626526`, type:"PAYIN",  amount:1000,  status:"EXPIRED" },
    { id:"3", date:"5/8/2026", orderId:`EXT${base}177823415236912369`, type:"PAYIN",  amount:20000, status:"EXPIRED" },
    { id:"4", date:"5/8/2026", orderId:`EXT${base}177823398651116181`, type:"PAYIN",  amount:500,   status:"EXPIRED" },
    { id:"5", date:"5/8/2026", orderId:`EXT${base}177823312345678901`, type:"PAYIN",  amount:3000,  status:"APPROVED" },
    { id:"6", date:"5/7/2026", orderId:`EXT${base}177812345678901234`, type:"PAYOUT", amount:2000,  status:"PROCESSING" },
  ];
}

const activityStatusStyle: Record<ActivityStatus, string> = {
  EXPIRED:    "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
  APPROVED:   "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  PENDING:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PROCESSING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  FAILED:     "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

const activityTypeStyle: Record<ActivityType, string> = {
  PAYIN:  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  PAYOUT: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");

const ACT_PAGE_SIZE = 5;

/* ── Stat card ── */
function StatCard({ label, value, icon, iconBg }: { label: string; value: number; icon: React.ReactNode; iconBg: string }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

/* ── Profile row ── */
function InfoRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-semibold text-gray-800 dark:text-gray-200 ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function AgentDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<AgentDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"accounts" | "stats">("stats");
  const [actPage, setActPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum < 1) {
      setNotFound(true);
      setDetail(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/agents/${id}`, { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; agent?: AgentDetailApi; error?: string };
      if (res.status === 401) {
        setLoadError("Admin sign-in required.");
        setDetail(null);
        return;
      }
      if (res.status === 404) {
        setNotFound(true);
        setDetail(null);
        return;
      }
      if (!res.ok || !data.ok || !data.agent) {
        setLoadError(data.error ?? "Could not load agent.");
        setDetail(null);
        return;
      }
      setDetail(data.agent);
    } catch {
      setLoadError("Network error.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const activity = getMockActivity(id);
  const actPaginated = activity.slice((actPage - 1) * ACT_PAGE_SIZE, actPage * ACT_PAGE_SIZE);
  const totalTx = activity.length;
  const completed = activity.filter((a) => a.status === "APPROVED").length;
  const processing = activity.filter((a) => a.status === "PROCESSING").length;
  const failed = activity.filter((a) => a.status === "EXPIRED" || a.status === "FAILED").length;
  const payins = activity.filter((a) => a.type === "PAYIN");
  const completedPayins = payins.filter((a) => a.status === "APPROVED").length;
  const payinVolume = payins.reduce((s, a) => s + a.amount, 0);
  const payinSuccess = payins.length ? ((completedPayins / payins.length) * 100).toFixed(2) : "0.00";
  const payouts = activity.filter((a) => a.type === "PAYOUT");
  const completedPayouts = payouts.filter((a) => a.status === "APPROVED").length;
  const payoutVolume = payouts.reduce((s, a) => s + a.amount, 0);
  const payoutSuccess = payouts.length ? ((completedPayouts / payouts.length) * 100).toFixed(2) : "0.00";

  async function patchStatus(next: string) {
    if (!detail) return;
    setToggleBusy(true);
    try {
      const res = await fetch(`/api/agents/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) await load();
    } finally {
      setToggleBusy(false);
    }
  }

  async function resetPassword() {
    if (!detail) return;
    const pwd = window.prompt("New password (min 6 characters recommended):");
    if (pwd == null || pwd === "") return;
    setResetBusy(true);
    try {
      const res = await fetch(`/api/agents/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pwd }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) window.alert(data.error ?? "Could not reset password.");
      else window.alert("Password updated.");
    } finally {
      setResetBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading agent…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
        <p className="mb-2">{loadError}</p>
        <Link href="/signin/admin" className="font-semibold text-blue-600 underline dark:text-blue-400">
          Sign in as admin
        </Link>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-300">Agent not found.</p>
        <Link href="/agent" className="mt-4 inline-block text-blue-500 hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  const agent = mapApiToView(detail);
  const initials = agent.username.slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/agent"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Agent Details — <span className="text-blue-500">{agent.username}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            Edit Agent
          </button>
          <button
            type="button"
            disabled={toggleBusy}
            onClick={() => void patchStatus(agent.rawStatus === "active" ? "deactivated" : "active")}
            className="rounded-xl bg-orange-400 hover:bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {agent.rawStatus === "active" ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            disabled={resetBusy}
            onClick={() => void resetPassword()}
            className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
          >
            Reset Password
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">

        {/* ── Left: Profile card ── */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Profile Information</span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(agent.rawStatus)}`}>
              {agent.rawStatus}
            </span>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center pt-6 pb-4 px-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-500 dark:bg-teal-600 mb-2 shrink-0">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{agent.username}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{agent.username.toLowerCase()}</p>
          </div>

          {/* Info rows */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <InfoRow label="Email / contact" value={agent.whatsapp} />
            <InfoRow label="Current Usage"     value={fmt(agent.currentUsage)} />
            <InfoRow label="Security Deposit"  value={fmt(agent.securityDeposit)} />
            <InfoRow label="Credit Limit"      value={fmt(agent.creditLimit)} />
            <InfoRow label="Net (PayIn - PayOut)" value={agent.net >= 0 ? fmt(agent.net) : `₹-${Math.abs(agent.net).toLocaleString("en-IN")}`} />
            <InfoRow label="Prev (Last Running)" value={fmt(agent.prevLastRunning)} />
            <InfoRow label="Running (Today)"   value={fmt(agent.runningToday)} />
            <InfoRow label="Final"             value={`₹${agent.final < 0 ? "-" : ""}${Math.abs(agent.final).toLocaleString("en-IN")}`}
              valueClass={agent.final < 0 ? "text-red-500 dark:text-red-400" : ""} />
            <InfoRow label="Remaining Balance" value={fmt(agent.remainingBalance)} />
            <InfoRow label="Settlement" value={fmt(agent.settlementAmount)} />
            <InfoRow label="PayIn Commission"  value={agent.payinCommission} />
            <InfoRow label="PayOut Commission" value={agent.payoutCommission} />
            <InfoRow label="Referral Commission" value={agent.referralCommission} />
            <InfoRow label="Referral Code"     value={agent.referralCode} />
            <InfoRow label="Account Created"   value={agent.accountCreated} />
          </div>

          {/* Performance Summary */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Performance Summary</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Success Rate",  value: agent.perf.successRate.toString() },
                { label: "Total Volume",  value: fmt(agent.perf.totalVolume) },
                { label: "Today",         value: fmt(agent.perf.today) },
                { label: "This Week",     value: fmt(agent.perf.thisWeek) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.value}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Full Transaction History
            </button>
          </div>
        </div>

        {/* ── Right: Tabs ── */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {(["accounts", "stats"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab === "accounts" ? "Payment Accounts" : "Transaction Stats"}
              </button>
            ))}
          </div>

          {/* ── Transaction Stats tab ── */}
          {activeTab === "stats" && (
            <div className="p-5 flex flex-col gap-5">
              {/* Section heading */}
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Transaction Statistics</h2>

              {/* 4 stat cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard label="Total Transactions" value={totalTx} iconBg="bg-blue-100 dark:bg-blue-900/30"
                  icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
                <StatCard label="Completed" value={completed} iconBg="bg-green-100 dark:bg-green-900/30"
                  icon={<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard label="Processing" value={processing} iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                  icon={<svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
                <StatCard label="Failed/Rejected" value={failed} iconBg="bg-red-100 dark:bg-red-900/30"
                  icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              </div>

              {/* Pay-In + Pay-Out stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pay-In */}
                <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/60 dark:bg-green-900/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Pay-In Statistics</h3>
                  </div>
                  {[
                    { label: "Total Pay-Ins:",       value: payins.length.toString() },
                    { label: "Completed Pay-Ins:",   value: completedPayins.toString() },
                    { label: "Total Volume:",        value: payinVolume >= 1000 ? `₹${(payinVolume/1000).toFixed(0)}K` : fmt(payinVolume) },
                    { label: "Success Rate:",        value: `${payinSuccess}%` },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-green-100 dark:border-green-900/30 last:border-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.label}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Pay-Out */}
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400">Pay-Out Statistics</h3>
                  </div>
                  {[
                    { label: "Total Pay-Outs:",      value: payouts.length.toString() },
                    { label: "Completed Pay-Outs:",  value: completedPayouts.toString() },
                    { label: "Total Volume:",        value: fmt(payoutVolume) },
                    { label: "Success Rate:",        value: `${payoutSuccess}%` },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-blue-100 dark:border-blue-900/30 last:border-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.label}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Recent Activity</h3>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
                          {["Date", "Order ID", "Type", "Amount", "Status"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {actPaginated.map((a) => (
                          <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{a.date}</td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-300 break-all max-w-[180px]">{a.orderId}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${activityTypeStyle[a.type]}`}>
                                {a.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                              ₹{a.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${activityStatusStyle[a.status]}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
                    <p className="text-xs text-gray-400 shrink-0">
                      Showing {(actPage - 1) * ACT_PAGE_SIZE + 1} to {Math.min(actPage * ACT_PAGE_SIZE, activity.length)} of {activity.length} entries
                    </p>
                    <Pagination total={activity.length} page={actPage} pageSize={ACT_PAGE_SIZE} onPageChange={setActPage} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Payment Accounts tab ── */}
          {activeTab === "accounts" && (
            <div className="p-5">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 py-14 text-center text-gray-400 dark:text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                No payment accounts linked.
              </div>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <EditAgentModal
          agent={toListAgent(detail)}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            void load();
          }}
        />
      )}
    </div>
  );
}
