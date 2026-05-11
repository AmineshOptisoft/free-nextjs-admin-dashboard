"use client";
import React, { useState } from "react";
import CreateUserModal from "./CreateUserModal";
import Pagination from "../ui/Pagination";
import { UserIcon } from "@/icons";

const PAGE_SIZE = 6;

type UserStatus = "active" | "inactive";
type UserRole   = "peer" | "agent" | "merchant" | "admin";

interface UserTag { label: string; color: string }
interface FinancialOverview {
  totalPayIn: number; totalPayOut: number;
  successPayIn: number; failedPayIn: number;
  successPayOut: number; failedPayOut: number;
}

interface User {
  id: string;
  name: string;
  username: string;
  status: UserStatus;
  role: UserRole;
  tags: UserTag[];
  indicatorColor: string;
  lastSeen: string;
  assignedTo: string;
  payInEnabled: boolean;
  payOutEnabled: boolean;
  operationType: string;
  gateway: string;
  financial: FinancialOverview;
}

const mockUsers: User[] = [
  { id:"1",  name:"Jagdamba rajputi tailor", username:"fjhg@123",        status:"active",   role:"peer",     tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PEER",color:"bg-gray-100 text-gray-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"}], indicatorColor:"bg-green-400", lastSeen:"Never", assignedTo:"Kanhal33",   payInEnabled:true,  payOutEnabled:false, operationType:"PayIn & PayOut", gateway:"UPI & Bank Transfer", financial:{totalPayIn:452367,totalPayOut:0,successPayIn:420000,failedPayIn:32367,successPayOut:0,failedPayOut:0} },
  { id:"2",  name:"Sarariya @(gap2",        username:"Sarariya@(gap2@jsjddk", status:"active", role:"peer",  tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PEER",color:"bg-gray-100 text-gray-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"}], indicatorColor:"bg-green-400", lastSeen:"Never", assignedTo:"Swariya105", payInEnabled:true,  payOutEnabled:false, operationType:"PayIn & PayOut", gateway:"UPI & Bank Transfer", financial:{totalPayIn:312450,totalPayOut:0,successPayIn:298000,failedPayIn:14450,successPayOut:0,failedPayOut:0} },
  { id:"3",  name:"Rahul Mehta",             username:"rahulm@upi",       status:"active",   role:"agent",   tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"},{label:"PAYOUT",color:"bg-purple-100 text-purple-600"}], indicatorColor:"bg-blue-400",  lastSeen:"2h ago",  assignedTo:"Leo_admin",  payInEnabled:true,  payOutEnabled:true,  operationType:"PayIn & PayOut", gateway:"UPI & Bank Transfer", financial:{totalPayIn:876540,totalPayOut:345678,successPayIn:820000,failedPayIn:56540,successPayOut:330000,failedPayOut:15678} },
  { id:"4",  name:"Priya Sharma",            username:"priyas@bank",      status:"active",   role:"merchant",tags:[{label:"PEER",color:"bg-gray-100 text-gray-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"}], indicatorColor:"bg-green-400", lastSeen:"Just now", assignedTo:"Rajesh_ops", payInEnabled:true,  payOutEnabled:false, operationType:"PayIn",          gateway:"Bank Transfer",       financial:{totalPayIn:1234567,totalPayOut:0,successPayIn:1190000,failedPayIn:44567,successPayOut:0,failedPayOut:0} },
  { id:"5",  name:"Suresh Kumar",            username:"sureshk@gpay",     status:"inactive", role:"peer",    tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PEER",color:"bg-gray-100 text-gray-600"}], indicatorColor:"bg-gray-300",  lastSeen:"3d ago",  assignedTo:"Neha_fin",   payInEnabled:false, payOutEnabled:false, operationType:"PayIn & PayOut", gateway:"UPI",                 financial:{totalPayIn:56780,totalPayOut:12345,successPayIn:50000,failedPayIn:6780,successPayOut:11000,failedPayOut:1345} },
  { id:"6",  name:"Anjali Nair",             username:"anjalin@okaxis",   status:"active",   role:"agent",   tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"},{label:"PAYOUT",color:"bg-purple-100 text-purple-600"}], indicatorColor:"bg-green-400", lastSeen:"5m ago",  assignedTo:"Leo_admin",  payInEnabled:true,  payOutEnabled:true,  operationType:"PayIn & PayOut", gateway:"UPI & Bank Transfer", financial:{totalPayIn:654321,totalPayOut:234567,successPayIn:620000,failedPayIn:34321,successPayOut:220000,failedPayOut:14567} },
  { id:"7",  name:"Vikram Patel",            username:"vikramp@sbi",      status:"inactive", role:"merchant",tags:[{label:"PEER",color:"bg-gray-100 text-gray-600"},{label:"PAYOUT",color:"bg-purple-100 text-purple-600"}], indicatorColor:"bg-red-400",   lastSeen:"1w ago",  assignedTo:"Suresh_mgr", payInEnabled:false, payOutEnabled:true,  operationType:"PayOut",         gateway:"Bank Transfer",       financial:{totalPayIn:0,totalPayOut:456789,successPayIn:0,failedPayIn:0,successPayOut:440000,failedPayOut:16789} },
  { id:"8",  name:"Deepak Gupta",            username:"deepakg@paytm",    status:"active",   role:"peer",    tags:[{label:"UPI",color:"bg-blue-100 text-blue-600"},{label:"PEER",color:"bg-gray-100 text-gray-600"},{label:"PAYIN",color:"bg-indigo-100 text-indigo-600"}], indicatorColor:"bg-green-400", lastSeen:"Never",   assignedTo:"Kanhal33",   payInEnabled:true,  payOutEnabled:false, operationType:"PayIn",          gateway:"UPI",                 financial:{totalPayIn:234560,totalPayOut:0,successPayIn:220000,failedPayIn:14560,successPayOut:0,failedPayOut:0} },
];

const fmt = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "₹0";

/* ── Toggle switch ── */
function Toggle({ enabled, color }: { enabled: boolean; color: "green" | "red" }) {
  const [on, setOn] = useState(enabled);
  const trackOn  = color === "green" ? "bg-green-400" : "bg-red-400";
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? trackOn : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

/* ── Financial Overview accordion ── */
function FinancialOverview({ data }: { data: User["financial"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-1 pt-3">
      {[
        { label: "Total Pay In",    value: fmt(data.totalPayIn) },
        { label: "Total Pay Out",   value: fmt(data.totalPayOut) },
        { label: "Success Pay In",  value: fmt(data.successPayIn) },
        { label: "Failed Pay In",   value: fmt(data.failedPayIn) },
        { label: "Success Pay Out", value: fmt(data.successPayOut) },
        { label: "Failed Pay Out",  value: fmt(data.failedPayOut) },
      ].map((r) => (
        <div key={r.label} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{r.label}</span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Single user card ── */
function UserCard({ user }: { user: User }) {
  const [finOpen, setFinOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
      <div className="p-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.username}</p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {user.tags.map((t) => (
            <span key={t.label} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.color}`}>{t.label}</span>
          ))}
          <span className={`w-2.5 h-2.5 rounded-full ${user.indicatorColor} ml-1`} />
        </div>

        {/* Activity row */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{user.lastSeen}</span>
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">{user.assignedTo}</span>
        </div>

        {/* Pay In / Pay Out toggles */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${user.payInEnabled ? "bg-green-50 dark:bg-green-900/10" : "bg-gray-50 dark:bg-gray-800"}`}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
              </svg>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pay In</span>
            </div>
            <Toggle enabled={user.payInEnabled} color="green" />
          </div>
          <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${user.payOutEnabled ? "bg-purple-50 dark:bg-purple-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pay Out</span>
            </div>
            <Toggle enabled={user.payOutEnabled} color="red" />
          </div>
        </div>
      </div>

      {/* Financial Overview accordion */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setFinOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Financial Overview
          </div>
          <svg className={`w-4 h-4 transition-transform duration-200 ${finOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {finOpen && (
          <div className="px-4 pb-4">
            <FinancialOverview data={user.financial} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── List row view ── */
function UserRow({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{user.username}</span>
          {user.tags.map((t) => (
            <span key={t.label} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.color}`}>{t.label}</span>
          ))}
          <span className={`w-2 h-2 rounded-full ${user.indicatorColor}`} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{user.assignedTo} · {user.lastSeen}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          <span className={`w-1.5 h-1.5 rounded-full ${user.payInEnabled ? "bg-green-400" : "bg-gray-300"}`} />
          Pay In
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          <span className={`w-1.5 h-1.5 rounded-full ${user.payOutEnabled ? "bg-purple-400" : "bg-gray-300"}`} />
          Pay Out
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
          {user.status}
        </span>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function UsersList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [roleFilter,   setRoleFilter]   = useState("All Roles");
  const [opFilter,     setOpFilter]     = useState("PayIn & PayOut");
  const [gwFilter,     setGwFilter]     = useState("UPI & Bank Transfer");

  // Pagination
  const [page, setPage] = useState(1);

  const filtered = mockUsers.filter((u) => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <UserIcon className="w-6 h-6" />
          <h1 className="text-lg font-bold">Payment Method</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Search + Filters toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSearchOpen((v) => !v); if (filtersOpen) setFiltersOpen(false); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition-colors ${
              searchOpen
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {searchOpen
              ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            }
            Search
          </button>
          <button
            onClick={() => { setFiltersOpen((v) => !v); if (searchOpen) setSearchOpen(false); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition-colors ${
              filtersOpen
                ? "bg-blue-500 text-white border-transparent"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M12 16h0" />
            </svg>
            Filters
          </button>
        </div>

        {/* Right: Status pills + view icons */}
        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-1">
            <button onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search panel ── */}
      {searchOpen && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or ID..."
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Filters panel ── */}
      {filtersOpen && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">User Role</label>
              <div className="relative">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                  {["All Roles","Peer","Agent","Merchant","Admin"].map((r) => <option key={r}>{r}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Operation Type</label>
              <div className="relative">
                <select value={opFilter} onChange={(e) => setOpFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                  {["PayIn & PayOut","PayIn","PayOut"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Gateway</label>
              <div className="relative">
                <select value={gwFilter} onChange={(e) => setGwFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                  {["UPI & Bank Transfer","UPI","Bank Transfer"].map((g) => <option key={g}>{g}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── User Directory heading ── */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-800 dark:text-white">User Directory</h2>
        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
          {filtered.length} users
        </span>
      </div>

      {/* ── Create User Modal ── */}
      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}

      {/* ── Grid / List ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] py-14 text-center text-gray-400">
          No users found.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((u) => <UserCard key={u.id} user={u} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {paginated.map((u) => <UserRow key={u.id} user={u} />)}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
