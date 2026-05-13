"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

type HistoryItem = { at: string; label: string; note: string };
type TransactionDetail = {
  id: number;
  orderId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  clientName: string;
  clientUpi: string;
  utrCode: string;
  paymentMethod: string;
  assignedUpi: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  accountHolder: string;
  assignedAgent: string;
  history: HistoryItem[];
};

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN");
}

export default function CompanyTransactionDetail({ id }: { id: string }) {
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/transactions/${id}`, { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; transaction?: TransactionDetail; error?: string };
      if (res.status === 401) {
        setError("Please sign in as company.");
        setTx(null);
        return;
      }
      if (!res.ok || !data.ok || !data.transaction) {
        setError(data.error ?? "Could not load transaction.");
        setTx(null);
        return;
      }
      setTx(data.transaction);
    } catch {
      setError("Network error.");
      setTx(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className="text-sm text-gray-500">Loading transaction…</div>;
  if (error || !tx) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-amber-700 dark:text-amber-300">{error ?? "Transaction not found."}</p>
        <Link href="/company-dashboard" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaction details</h1>
        <Link
          href="/company-dashboard"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Transaction information</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Transaction ID:</span> <span className="font-medium">{tx.id}</span>
            </p>
            <p>
              <span className="text-gray-500">Type:</span> <span className="font-medium">{tx.type}</span>
            </p>
            <p>
              <span className="text-gray-500">Amount:</span>{" "}
              <span className="font-medium">₹{tx.amount.toLocaleString("en-IN")}</span>
            </p>
            <p>
              <span className="text-gray-500">Status:</span> <span className="font-medium">{tx.status}</span>
            </p>
            <p>
              <span className="text-gray-500">Created:</span> <span className="font-medium">{fmtDate(tx.createdAt)}</span>
            </p>
            <p>
              <span className="text-gray-500">Updated:</span> <span className="font-medium">{fmtDate(tx.updatedAt)}</span>
            </p>
            <p>
              <span className="text-gray-500">Assigned agent:</span> <span className="font-medium">{tx.assignedAgent}</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Client &amp; bank</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Client name:</span> <span className="font-medium">{tx.clientName}</span>
            </p>
            <p>
              <span className="text-gray-500">Client UPI:</span> <span className="font-medium">{tx.clientUpi}</span>
            </p>
            <p>
              <span className="text-gray-500">Order ID:</span> <span className="font-medium">{tx.orderId}</span>
            </p>
            <p>
              <span className="text-gray-500">UTR:</span> <span className="font-medium">{tx.utrCode}</span>
            </p>
            <p>
              <span className="text-gray-500">Payment method:</span> <span className="font-medium">{tx.paymentMethod}</span>
            </p>
            <p>
              <span className="text-gray-500">Assigned UPI:</span> <span className="font-medium">{tx.assignedUpi}</span>
            </p>
            <p>
              <span className="text-gray-500">Bank:</span> <span className="font-medium">{tx.bankName}</span>
            </p>
            <p>
              <span className="text-gray-500">Account:</span> <span className="font-medium">{tx.accountNo}</span>
            </p>
            <p>
              <span className="text-gray-500">IFSC:</span> <span className="font-medium">{tx.ifsc}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <h2 className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">History</h2>
        <div className="space-y-2">
          {tx.history.map((h, i) => (
            <div
              key={`${h.at}-${i}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Status: {h.label}</p>
                <p className="text-xs text-gray-500">{h.note}</p>
              </div>
              <p className="text-xs text-gray-500 shrink-0">{fmtDate(h.at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
