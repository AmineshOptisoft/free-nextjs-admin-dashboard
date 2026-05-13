"use client";
import React, { useState } from "react";
import type { Agent } from "./types";

type Props = { agent: Agent; onClose: () => void; onSaved: () => void };

export default function EditAgentModal({ agent, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    fullname: agent.fullname ?? "",
    username: agent.username,
    email: agent.email ?? "",
    security_deposit: String(agent.security_deposit),
    credit_limit: String(agent.credit_limit),
    pay_in_commission: String(agent.pay_in_commission),
    pay_out_commission: String(agent.pay_out_commission),
    referral_commission: String(agent.referral_commission),
    status: agent.status,
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5";

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        fullname: form.fullname.trim(),
        username: form.username.trim(),
        email: form.email.trim() || null,
        security_deposit: form.security_deposit,
        credit_limit: form.credit_limit,
        pay_in_commission: form.pay_in_commission,
        pay_out_commission: form.pay_out_commission,
        referral_commission: form.referral_commission,
        status: form.status,
      };
      if (form.newPassword.trim()) body.password = form.newPassword;
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit vendor — {agent.username}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {error && (
            <div className="sm:col-span-2 text-sm text-red-500" role="alert">
              {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelCls}>Full name</label>
            <input value={form.fullname} onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Username</label>
            <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Security deposit</label>
            <input value={form.security_deposit} onChange={(e) => setForm((p) => ({ ...p, security_deposit: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Credit limit</label>
            <input value={form.credit_limit} onChange={(e) => setForm((p) => ({ ...p, credit_limit: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Pay-in commission (%)</label>
            <input value={form.pay_in_commission} onChange={(e) => setForm((p) => ({ ...p, pay_in_commission: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Pay-out commission (%)</label>
            <input value={form.pay_out_commission} onChange={(e) => setForm((p) => ({ ...p, pay_out_commission: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Referral commission (%)</label>
            <input value={form.referral_commission} onChange={(e) => setForm((p) => ({ ...p, referral_commission: e.target.value }))} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inputCls} disabled={saving}>
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="deactivated">deactivated</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
          {/* <div className="sm:col-span-2">
            <label className={labelCls}>New password (optional)</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              className={inputCls}
              disabled={saving}
            />
          </div> */}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
