"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTransactionRealtimeRefresh } from "@/hooks/useTransactionRealtimeRefresh";
import CompanyTxnAccordionCard from "../company/CompanyTxnAccordionCard";
import { Modal } from "../ui/modal";
import Pagination from "../ui/Pagination";
import { PayInIcon } from "@/icons/nav-icons";

type CompanyPayIn = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  clientName: string;
  clientUpi: string;
  assignedUpi: string;
  createdAtIso?: string;
  utrCode?: string;
  hasReceipt?: boolean;
  remarks?: string;
  assignedAtIso?: string;
  assignedToLabel?: string;
  expiresAtIso?: string;
};

type TabValue = "ALL" | "NOT_ASSIGNED" | "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "EXPIRED";

function NewPayInRequestModal({
  isOpen,
  onClose,
  onSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({ client_name: "", client_upi: "", amount: "", user_note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/15";

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/company/payins", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create payin");
        return;
      }
      setForm({ client_name: "", client_upi: "", amount: "", user_note: "" });
      onClose();
      onSubmitted();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-0 overflow-hidden" showCloseButton={false}>
      <div className="rounded-xl bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-xl font-semibold text-gray-900">New PayIn Request</h3>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            x
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Client Name *</label>
            <input className={inputClass} value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Client UPI *</label>
            <input className={inputClass} value={form.client_upi} onChange={(e) => setForm((p) => ({ ...p, client_upi: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Amount *</label>
            <input className={inputClass} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600">Note</label>
            <input className={inputClass} value={form.user_note} onChange={(e) => setForm((p) => ({ ...p, user_note: e.target.value }))} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600">
              Cancel
            </button>
            <button type="button" disabled={saving} onClick={() => void submit()} className="rounded-md bg-brand-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function CompanyPayInView() {
  const [tab, setTab] = useState<TabValue>("ALL");
  const [items, setItems] = useState<CompanyPayIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const tabs: { label: string; value: TabValue }[] = [
    { label: "All", value: "ALL" },
    { label: "Waiting", value: "NOT_ASSIGNED" },
    { label: "Pending", value: "PENDING" },
    { label: "Paid", value: "PAID" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Expired", value: "EXPIRED" },
  ];

  const { loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/payins`, { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; payins?: CompanyPayIn[]; error?: string };
      if (!res.ok || !data.ok || !data.payins) {
        setError(data.error ?? "Could not load payins");
        setItems([]);
        return;
      }
      setItems(data.payins);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  useTransactionRealtimeRefresh({ types: ["PAYIN"], onRefresh: () => void load() });

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      NOT_ASSIGNED: items.filter((d) => d.status === "NOT_ASSIGNED").length,
      PENDING: items.filter((d) => d.status === "PENDING").length,
      PAID: items.filter((d) => d.status === "PAID" || d.status === "RECEIPT_PENDING").length,
      APPROVED: items.filter((d) => d.status.includes("APPROVED")).length,
      REJECTED: items.filter((d) => d.status === "REJECTED" || d.status === "DECLINED" || d.status === "REVOKED").length,
      EXPIRED: items.filter((d) => d.status === "EXPIRED").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (tab === "ALL") return items;
    if (tab === "REJECTED") return items.filter((d) => d.status === "REJECTED" || d.status === "DECLINED" || d.status === "REVOKED");
    if (tab === "APPROVED") return items.filter((d) => d.status.includes("APPROVED"));
    if (tab === "PAID") return items.filter((d) => d.status === "PAID" || d.status === "RECEIPT_PENDING");
    return items.filter((d) => d.status === tab);
  }, [items, tab]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  async function submitProof(id: string) {
    const utr = window.prompt("Enter UTR code");
    if (utr == null) return;
    const res = await fetch(`/api/company/payins/${id}/proof`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utr_code: utr }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      window.alert(data.error ?? "Could not submit proof");
      return;
    }
    await load();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <PayInIcon />
          <h1 className="text-xl font-bold">Pay In Management</h1>
        </div>
        {/* <button onClick={() => setRequestOpen(true)} className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white">
          New Request
        </button> */}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const count = counts[t.value as keyof typeof counts];
          const isActive = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t.label}
              {count !== undefined && count > 0 && !isActive && (
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && <div className="rounded-xl border border-gray-100 px-3 py-5 text-sm text-gray-500">Loading payins...</div>}
      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">{error}</div>}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="rounded-xl border border-gray-100 px-3 py-8 text-sm text-gray-400">No PayIn requests found in this tab.</div>
      )}

      <div className="space-y-3">
        {paginatedItems.map((it) => (
          <CompanyTxnAccordionCard
            key={it.id}
            variant="PAYIN"
            transactionId={it.id}
            orderId={it.orderId}
            amount={it.amount}
            status={it.status}
            clientName={it.clientName}
            clientUpi={it.clientUpi}
            utrCode={it.utrCode ?? ""}
            assignedUpi={it.assignedUpi}
            createdAtIso={it.createdAtIso}
            assignedAtIso={it.assignedAtIso}
            assignedToLabel={it.assignedToLabel ?? "—"}
            remarks={it.remarks ?? ""}
            expiresAtIso={it.expiresAtIso}
          />
        ))}
      </div>

      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-xs text-gray-400 shrink-0">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredItems.length)} of {filteredItems.length} entries
          </p>
          <Pagination
            total={filteredItems.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <NewPayInRequestModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} onSubmitted={() => void load()} />
    </div>
  );
}
