"use client";
import React, { useCallback, useEffect, useState } from "react";
import CompanyTxnAccordionCard from "../company/CompanyTxnAccordionCard";
import { Modal } from "../ui/modal";
import { PiContactlessPaymentFill } from "react-icons/pi";

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

  const tabs: { label: string; value: TabValue }[] = [
    { label: "All", value: "ALL" },
    { label: "Waiting", value: "NOT_ASSIGNED" },
    { label: "Pending", value: "PENDING" },
    { label: "Paid", value: "PAID" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Expired", value: "EXPIRED" },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = tab === "ALL" ? "" : `?status=${encodeURIComponent(tab)}`;
      const res = await fetch(`/api/company/payins${query}`, { credentials: "include" });
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
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

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
          <PiContactlessPaymentFill className="w-6 h-6" />
          <h1 className="text-xl font-bold">Pay In Management</h1>
        </div>
        {/* <button onClick={() => setRequestOpen(true)} className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white">
          New Request
        </button> */}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.value
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="rounded-xl border border-gray-100 px-3 py-5 text-sm text-gray-500">Loading payins...</div>}
      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-gray-100 px-3 py-8 text-sm text-gray-400">No PayIn requests found.</div>
      )}

      <div className="space-y-3">
        {items.map((it) => (
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
            // footer={
            //   it.status === "PENDING" || it.status === "RE_ASSIGNED" ? (
            //     <button
            //       type="button"
            //       onClick={() => void submitProof(it.id)}
            //       className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            //     >
            //       Submit UTR/Proof
            //     </button>
            //   ) : undefined
            // }
          />
        ))}
      </div>

      <NewPayInRequestModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} onSubmitted={() => void load()} />
    </div>
  );
}
