"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import type { PayMethodFinancial } from "@/lib/transactions-pay-method-financials";
import CreateUserModal, { type PaymentMethodEditPayload } from "./CreateUserModal";
import Pagination from "../ui/Pagination";
import { UserIcon } from "@/icons";

const PAGE_SIZE = 6;

type UserStatus = "active" | "inactive";
type UserRole = "peer" | "agent" | "merchant" | "admin";

interface UserTag {
  label: string;
  color: string;
}
interface FinancialOverview {
  totalPayIn: number;
  totalPayOut: number;
  successPayIn: number;
  failedPayIn: number;
  successPayOut: number;
  failedPayOut: number;
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

type ApiPaymentMethod = {
  id: string;
  fullname: string;
  username: string;
  email: string | null;
  phone: string | null;
  role_label: string;
  pay_in_enabled: boolean;
  pay_out_enabled: boolean;
  operation_type: string;
  gateway: string;
  tags: string[];
  status: string;
  last_seen_label: string;
  assigned_to: string;
  upi_id?: string | null;
  bank_name?: string | null;
  account_no?: string | null;
  ifsc_code?: string | null;
  branch_name?: string | null;
  account_holder_name?: string | null;
  financial?: PayMethodFinancial;
};

const emptyFinancial: FinancialOverview = {
  totalPayIn: 0,
  totalPayOut: 0,
  successPayIn: 0,
  failedPayIn: 0,
  successPayOut: 0,
  failedPayOut: 0,
};

function roleLabelToUserRole(roleLabel: string): UserRole {
  const r = roleLabel.toLowerCase();
  if (r.includes("merchant")) return "merchant";
  if (r.includes("agent") && !r.includes("sub")) return "agent";
  if (r.includes("admin")) return "admin";
  return "peer";
}

const TAG_COLORS: Record<string, string> = {
  UPI: "bg-blue-100 text-blue-600",
  BANK: "bg-amber-100 text-amber-700",
  PEER: "bg-gray-100 text-gray-600",
  PAYIN: "bg-indigo-100 text-indigo-600",
  PAYOUT: "bg-purple-100 text-purple-600",
};

function tagsToUserTags(tags: string[]): UserTag[] {
  return tags.map((t) => ({ label: t, color: TAG_COLORS[t] ?? "bg-gray-100 text-gray-600" }));
}

function paymentMethodToUser(s: ApiPaymentMethod): User {
  const status: UserStatus = s.status === "inactive" ? "inactive" : "active";
  return {
    id: s.id,
    name: s.fullname || s.username,
    username: s.username,
    status,
    role: roleLabelToUserRole(s.role_label),
    tags: tagsToUserTags(s.tags.length ? s.tags : ["UPI"]),
    indicatorColor: status === "active" ? "bg-green-400" : "bg-gray-300",
    lastSeen: s.last_seen_label || "Never",
    assignedTo: s.assigned_to,
    payInEnabled: s.pay_in_enabled,
    payOutEnabled: s.pay_out_enabled,
    operationType: s.operation_type,
    gateway: s.gateway,
    financial: s.financial
      ? {
        totalPayIn: s.financial.totalPayIn,
        totalPayOut: s.financial.totalPayOut,
        successPayIn: s.financial.successPayIn,
        failedPayIn: s.financial.failedPayIn,
        successPayOut: s.financial.successPayOut,
        failedPayOut: s.financial.failedPayOut,
      }
      : { ...emptyFinancial },
  };
}

function payMethodToEditPayload(s: ApiPaymentMethod): PaymentMethodEditPayload {
  const isBank = s.gateway === "Bank Transfer Only";
  return {
    id: s.id,
    fullname: s.fullname,
    email: s.email ?? "",
    phone: s.phone ?? "",
    role: s.role_label,
    username: s.username,
    enablePayIn: s.pay_in_enabled,
    enablePayOut: s.pay_out_enabled,
    opType: s.operation_type,
    gateway: s.gateway,
    upiId: s.upi_id ?? "",
    accountHolderName: !isBank ? (s.account_holder_name ?? "") : "",
    bankAccountHolder: isBank ? (s.account_holder_name ?? "") : "",
    bankName: s.bank_name ?? "",
    accountNo: s.account_no ?? "",
    ifscCode: s.ifsc_code ?? "",
    branchName: s.branch_name ?? "",
  };
}

const fmt = (n: number) => (n > 0 ? "₹" + n.toLocaleString("en-IN") : "₹0");

function Toggle({
  enabled,
  color,
  disabled,
  onChange,
}: {
  enabled: boolean;
  color: "green" | "red";
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const trackOn = color === "green" ? "bg-green-400" : "bg-red-400";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? trackOn : "bg-gray-200 dark:bg-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

function FinancialOverview({ data }: { data: User["financial"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-1 pt-3">
      {[
        { label: "Total Pay In", value: fmt(data.totalPayIn) },
        { label: "Total Pay Out", value: fmt(data.totalPayOut) },
        { label: "Success Pay In", value: fmt(data.successPayIn) },
        { label: "Failed Pay In", value: fmt(data.failedPayIn) },
        { label: "Success Pay Out", value: fmt(data.successPayOut) },
        { label: "Failed Pay Out", value: fmt(data.failedPayOut) },
      ].map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400">{r.label}</span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function UserCard({
  user,
  patchBusy,
  onPatchFlags,
  onEdit,
  onDelete,
}: {
  user: User;
  patchBusy: boolean;
  onPatchFlags: (payIn: boolean, payOut: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [finOpen, setFinOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {user.tags.map((t) => (
            <span key={t.label} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.color}`}>
              {t.label}
            </span>
          ))}
          <span className={`w-2.5 h-2.5 rounded-full ${user.indicatorColor} ml-1`} />
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 dark:text-gray-500">
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

        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 rounded-lg border border-red-200 dark:border-red-900/40 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2 ${user.payInEnabled ? "bg-green-50 dark:bg-green-900/10" : "bg-gray-50 dark:bg-gray-800"
              }`}
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
              </svg>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pay In</span>
            </div>
            <Toggle
              enabled={user.payInEnabled}
              color="green"
              disabled={patchBusy}
              onChange={(next) => onPatchFlags(next, user.payOutEnabled)}
            />
          </div>
          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2 ${user.payOutEnabled ? "bg-purple-50 dark:bg-purple-900/10" : "bg-red-50 dark:bg-red-900/10"
              }`}
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pay Out</span>
            </div>
            <Toggle
              enabled={user.payOutEnabled}
              color="red"
              disabled={patchBusy}
              onChange={(next) => onPatchFlags(user.payInEnabled, next)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setFinOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Financial Overview
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${finOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
            <span key={t.label} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.color}`}>
              {t.label}
            </span>
          ))}
          <span className={`w-2 h-2 rounded-full ${user.indicatorColor}`} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {user.assignedTo} · {user.lastSeen}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-blue-600 hover:underline">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-red-600 hover:underline">
          Delete
        </button>
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
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
            }`}
        >
          {user.status}
        </span>
      </div>
    </div>
  );
}

function roleFilterMatch(roleFilter: string, u: User): boolean {
  if (roleFilter === "All Roles") return true;
  const map: Record<string, UserRole> = {
    Peer: "peer",
    Agent: "agent",
    Merchant: "merchant",
    Admin: "admin",
  };
  const want = map[roleFilter];
  return want === undefined || u.role === want;
}

function opFilterMatch(opFilter: string, u: User): boolean {
  const t = u.operationType;
  if (opFilter === "PayIn & PayOut") return t === "PayIn & PayOut";
  if (opFilter === "PayIn") return t === "PayIn Only" || t === "PayIn & PayOut";
  if (opFilter === "PayOut") return t === "PayOut Only" || t === "PayIn & PayOut";
  return true;
}

function gwFilterMatch(gwFilter: string, u: User): boolean {
  const g = u.gateway;
  if (gwFilter === "All") return true;
  if (gwFilter === "UPI") return g === "UPI Only" || g === "UPI & Bank Transfer";
  if (gwFilter === "Bank Transfer") return g === "Bank Transfer Only" || g === "UPI & Bank Transfer";
  return true;
}

export default function UsersList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethodEditPayload | null>(null);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<ApiPaymentMethod[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [patchingId, setPatchingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [opFilter, setOpFilter] = useState("PayIn & PayOut");
  const [gwFilter, setGwFilter] = useState("All");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/agent/staff", { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; payment_methods?: ApiPaymentMethod[]; error?: string };
      if (res.status === 401) {
        setLoadError("AGENT_AUTH");
        setRawPaymentMethods([]);
        setUsers([]);
        return;
      }
      if (!res.ok || !data.ok || !data.payment_methods) {
        setLoadError(data.error ?? "Could not load payment methods.");
        setRawPaymentMethods([]);
        setUsers([]);
        return;
      }
      setRawPaymentMethods(data.payment_methods);
      setUsers(data.payment_methods.map(paymentMethodToUser));
    } catch {
      setLoadError("Network error.");
      setRawPaymentMethods([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchFlags(methodId: string, payIn: boolean, payOut: boolean) {
    setPatchingId(methodId);
    try {
      const res = await fetch(`/api/agent/staff/${methodId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pay_in_enabled: payIn, pay_out_enabled: payOut }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setLoadError(data.error ?? "Could not update.");
        return;
      }
      await load();
    } catch {
      setLoadError("Network error.");
    } finally {
      setPatchingId(null);
    }
  }

  async function deletePaymentMethod(methodId: string) {
    if (!window.confirm("Delete this payment method?")) return;
    try {
      const res = await fetch(`/api/agent/staff/${methodId}`, { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setLoadError(data.error ?? "Could not delete.");
        return;
      }
      await load();
    } catch {
      setLoadError("Network error.");
    }
  }

  const filtered = users.filter((u) => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (!roleFilterMatch(roleFilter, u)) return false;
    if (!opFilterMatch(opFilter, u)) return false;
    if (!gwFilterMatch(gwFilter, u)) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loadError === "AGENT_AUTH") {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 px-6 py-8 text-center">
        <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Agent sign-in required</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage payment methods after signing in as an agent.</p>
        <Link
          href="/signin/agent"
          className="inline-flex rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Agent sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <UserIcon className="w-6 h-6" />
          <div>
            <h1 className="text-lg font-bold">Payment Method</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rows in pay_methods for this agent</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditPaymentMethod(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add payment method
        </button>
      </div>

      {loadError && loadError !== "AGENT_AUTH" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {loadError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              if (filtersOpen) setFiltersOpen(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition-colors ${searchOpen
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
          >
            {searchOpen ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setFiltersOpen((v) => !v);
              if (searchOpen) setSearchOpen(false);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition-colors ${filtersOpen
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

        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${statusFilter === s
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username…"
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>
      )}

      {filtersOpen && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                User Role
              </label>
              <div className="relative">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                  {["All Roles", "Peer", "Vendor", "Merchant", "Admin"].map((r) => <option key={r}>{r}</option>)}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Operation Type
              </label>
              <div className="relative">
                <select
                  value={opFilter}
                  onChange={(e) => setOpFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                >
                  {["PayIn & PayOut", "PayIn", "PayOut"].map((o) => (
                    <option key={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Method
              </label>
              <div className="relative">
                <select
                  value={gwFilter}
                  onChange={(e) => setGwFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                >
                  {["All", "UPI", "Bank Transfer"].map((g) => (
                    <option key={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-800 dark:text-white">Payment methods</h2>
        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
          {loading ? "…" : `${filtered.length} methods`}
        </span>
      </div>

      {showCreateModal && (
        <CreateUserModal
          editPaymentMethod={editPaymentMethod}
          onClose={() => {
            setShowCreateModal(false);
            setEditPaymentMethod(null);
          }}
          onSuccess={() => void load()}
        />
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] py-14 text-center text-gray-400">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] py-14 text-center text-gray-400">
          No payment methods yet. Use Add payment method to create one.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              patchBusy={patchingId === u.id}
              onPatchFlags={(payIn, payOut) => void patchFlags(u.id, payIn, payOut)}
              onEdit={() => {
                const s = rawPaymentMethods.find((x) => x.id === u.id);
                if (s) {
                  setEditPaymentMethod(payMethodToEditPayload(s));
                  setShowCreateModal(true);
                }
              }}
              onDelete={() => void deletePaymentMethod(u.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          {paginated.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onEdit={() => {
                const s = rawPaymentMethods.find((x) => x.id === u.id);
                if (s) {
                  setEditPaymentMethod(payMethodToEditPayload(s));
                  setShowCreateModal(true);
                }
              }}
              onDelete={() => void deletePaymentMethod(u.id)}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}
    </div>
  );
}
