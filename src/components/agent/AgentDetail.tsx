"use client";
import React, { useState } from "react";
import Link from "next/link";
import Pagination from "../ui/Pagination";

/* ── Mock agent data ── */
const agentDb: Record<string, {
  id: string; username: string; displayName: string; parent: string;
  status: "online" | "offline"; whatsapp: string; currentUsage: number;
  securityDeposit: number; creditLimit: number; net: number;
  prevLastRunning: number; runningToday: number; final: number;
  remainingBalance: number; payinCommission: string; payoutCommission: string;
  referralCommission: string; referralCode: string; accountCreated: string;
  perf: { successRate: number; totalVolume: number; today: number; thisWeek: number };
}> = {
  "1":  { id:"1",  username:"Mafiya0808",  displayName:"Mafiya0808",  parent:"daniyalleo", status:"online",  whatsapp:"8200000000", currentUsage:0,    securityDeposit:100000, creditLimit:0, net:3000,  prevLastRunning:0,  runningToday:3000,  final:-92000, remainingBalance:92000, payinCommission:"2%",  payoutCommission:"0%", referralCommission:"0%", referralCode:"8395394688", accountCreated:"5/6/2026", perf:{successRate:5.26,totalVolume:3000,today:0,thisWeek:3000} },
  "2":  { id:"2",  username:"Ajmonu8989",  displayName:"Ajmonu8989",  parent:"daniyalleo", status:"online",  whatsapp:"9100000001", currentUsage:0,    securityDeposit:50000,  creditLimit:0, net:1000,  prevLastRunning:0,  runningToday:1000,  final:-49000, remainingBalance:49000, payinCommission:"2%",  payoutCommission:"0%", referralCommission:"0%", referralCode:"7485920134", accountCreated:"5/1/2026", perf:{successRate:8.33,totalVolume:1000,today:1000,thisWeek:1000} },
  "3":  { id:"3",  username:"Salasar007",  displayName:"Salasar007",  parent:"daniyalleo", status:"offline", whatsapp:"N/A",        currentUsage:0,    securityDeposit:0,      creditLimit:0, net:0,     prevLastRunning:0,  runningToday:0,     final:0,      remainingBalance:0,     payinCommission:"1.5%",payoutCommission:"0%", referralCommission:"0%", referralCode:"N/A",        accountCreated:"4/20/2026",perf:{successRate:0,totalVolume:0,today:0,thisWeek:0} },
  "4":  { id:"4",  username:"Anjani2424",  displayName:"Anjani2424",  parent:"daniyalleo", status:"online",  whatsapp:"9300000003", currentUsage:5000, securityDeposit:75000,  creditLimit:500, net:8000, prevLastRunning:2000, runningToday:8000, final:-67000, remainingBalance:67000, payinCommission:"2%",  payoutCommission:"0%", referralCommission:"0%", referralCode:"6371058249", accountCreated:"4/15/2026",perf:{successRate:12.5,totalVolume:8000,today:5000,thisWeek:8000} },
  "5":  { id:"5",  username:"Chirag3232",  displayName:"Chirag3232",  parent:"daniyalleo", status:"online",  whatsapp:"9400000004", currentUsage:2000, securityDeposit:25000,  creditLimit:200, net:2000, prevLastRunning:0,   runningToday:2000, final:-23000, remainingBalance:23000, payinCommission:"3%",  payoutCommission:"0%", referralCommission:"0%", referralCode:"5260947138", accountCreated:"4/10/2026",perf:{successRate:4.0,totalVolume:2000,today:2000,thisWeek:2000} },
  "6":  { id:"6",  username:"Prince334",   displayName:"Prince334",   parent:"daniyalleo", status:"offline", whatsapp:"9500000005", currentUsage:0,    securityDeposit:10000,  creditLimit:0, net:-500, prevLastRunning:0,   runningToday:0,    final:-10500, remainingBalance:10500, payinCommission:"2%",  payoutCommission:"0%", referralCommission:"0%", referralCode:"4159836027", accountCreated:"3/28/2026",perf:{successRate:0,totalVolume:0,today:0,thisWeek:0} },
};

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
  const agent = agentDb[id] ?? {
    id, username: `Agent#${id}`, displayName: `Agent#${id}`, parent: "—",
    status: "offline" as const, whatsapp: "N/A", currentUsage: 0, securityDeposit: 0,
    creditLimit: 0, net: 0, prevLastRunning: 0, runningToday: 0, final: 0,
    remainingBalance: 0, payinCommission: "0%", payoutCommission: "0%",
    referralCommission: "0%", referralCode: "N/A", accountCreated: "—",
    perf: { successRate: 0, totalVolume: 0, today: 0, thisWeek: 0 },
  };

  const activity = getMockActivity(id);
  const [activeTab, setActiveTab] = useState<"accounts" | "stats">("stats");
  const [actPage, setActPage] = useState(1);
  const actPaginated = activity.slice((actPage - 1) * ACT_PAGE_SIZE, actPage * ACT_PAGE_SIZE);

  const totalTx    = activity.length;
  const completed  = activity.filter((a) => a.status === "APPROVED").length;
  const processing = activity.filter((a) => a.status === "PROCESSING").length;
  const failed     = activity.filter((a) => a.status === "EXPIRED" || a.status === "FAILED").length;

  const payins          = activity.filter((a) => a.type === "PAYIN");
  const completedPayins = payins.filter((a) => a.status === "APPROVED").length;
  const payinVolume     = payins.reduce((s, a) => s + a.amount, 0);
  const payinSuccess    = payins.length ? ((completedPayins / payins.length) * 100).toFixed(2) : "0.00";

  const payouts          = activity.filter((a) => a.type === "PAYOUT");
  const completedPayouts = payouts.filter((a) => a.status === "APPROVED").length;
  const payoutVolume     = payouts.reduce((s, a) => s + a.amount, 0);
  const payoutSuccess    = payouts.length ? ((completedPayouts / payouts.length) * 100).toFixed(2) : "0.00";

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
          <button className="rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm">
            Edit Agent
          </button>
          <button className="rounded-xl bg-orange-400 hover:bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm">
            {agent.status === "online" ? "Deactivate" : "Activate"}
          </button>
          <button className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm">
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
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              agent.status === "online"
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {agent.status === "online" ? "ACTIVE" : "INACTIVE"}
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
            <InfoRow label="WhatsApp Number"   value={agent.whatsapp} />
            <InfoRow label="Current Usage"     value={fmt(agent.currentUsage)} />
            <InfoRow label="Security Deposit"  value={fmt(agent.securityDeposit)} />
            <InfoRow label="Credit Limit"      value={fmt(agent.creditLimit)} />
            <InfoRow label="Net (PayIn - PayOut)" value={agent.net >= 0 ? fmt(agent.net) : `₹-${Math.abs(agent.net).toLocaleString("en-IN")}`} />
            <InfoRow label="Prev (Last Running)" value={fmt(agent.prevLastRunning)} />
            <InfoRow label="Running (Today)"   value={fmt(agent.runningToday)} />
            <InfoRow label="Final"             value={`₹${agent.final < 0 ? "-" : ""}${Math.abs(agent.final).toLocaleString("en-IN")}`}
              valueClass={agent.final < 0 ? "text-red-500 dark:text-red-400" : ""} />
            <InfoRow label="Remaining Balance" value={fmt(agent.remainingBalance)} />
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
    </div>
  );
}
