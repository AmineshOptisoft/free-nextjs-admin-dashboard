"use client";
import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

function localPartFromEmail(email: string): string {
  const t = email.trim();
  const at = t.indexOf("@");
  if (at <= 0) return "";
  return t.slice(0, at).trim();
}

export default function CreateAgentModal({ onClose, onCreated }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    password: "",
    email: "",
    securityDeposit: "",
    creditLimit: "",
    payinCommission: "",
    payoutCommission: "",
    referral: "",
    referralCommission: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2";

  const referralEntered = form.referral.trim().length > 0;

  async function submit() {
    setError(null);
    const username = localPartFromEmail(form.email).trim();
    const password = form.password;

    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.email.trim() || !username) { setError("Valid email (with @) is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (form.securityDeposit === "") { setError("Security Deposit is required."); return; }
    if (form.payinCommission === "") { setError("PayIn Commission is required."); return; }
    if (form.payoutCommission === "") { setError("PayOut Commission is required."); return; }
    if (referralEntered && form.referralCommission.trim() === "") { setError("Referral Commission is required when a referral is entered."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          fullname: form.name.trim(),
          email: form.email.trim() || undefined,
          security_deposit: form.securityDeposit || "0",
          credit_limit: form.creditLimit || "0",
          pay_in_commission: form.payinCommission || "0",
          pay_out_commission: form.payoutCommission || "0",
          referral_commission: referralEntered ? form.referralCommission.trim() || "0" : "0",
          status: isActive ? "active" : "blocked",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        setError("Admin sign-in required.");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create agent.");
        return;
      }
      await Promise.resolve(onCreated?.());
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

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="w-4.5 h-4.5 text-green-600 dark:text-green-400" style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Vendor</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {error && (
            <div className="sm:col-span-2 text-sm text-red-500" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Enter name" className={inputCls} disabled={saving} required />
          </div>

          <div>
            <label className={labelCls}>Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="agent@example.com"
              className={inputCls}
              disabled={saving}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Enter password"
                className={`${inputCls} pr-12`}
                disabled={saving}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Security Deposit <span className="text-red-500">*</span></label>
            <input type="number" value={form.securityDeposit} onChange={set("securityDeposit")} placeholder="Amount" className={inputCls} disabled={saving} required />
          </div>

          <div>
            <label className={labelCls}>Credit Limit</label>
            <input
              type="number"
              value={form.creditLimit}
              onChange={set("creditLimit")}
              placeholder="0"
              className={inputCls}
              disabled={saving}
            />
            <p className="mt-1 text-[10px] leading-snug text-gray-500 dark:text-gray-400">
              Extra PayIn headroom beyond the security pool — PayIns can still be accepted up to this amount even when deposit-backed room is exhausted.
            </p>
          </div>

          <div>
            <label className={labelCls}>PayIn Commission (%) <span className="text-red-500">*</span></label>
            <input type="text" value={form.payinCommission} onChange={set("payinCommission")} placeholder="e.g. 0.6, 2, 3" className={inputCls} disabled={saving} required />
          </div>

          <div>
            <label className={labelCls}>PayOut Commission (%) <span className="text-red-500">*</span></label>
            <input type="text" value={form.payoutCommission} onChange={set("payoutCommission")} placeholder="e.g. 0.1, 1.5" className={inputCls} disabled={saving} required />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              Referral <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={form.referral}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({
                  ...p,
                  referral: v,
                  referralCommission: v.trim() === "" ? "" : p.referralCommission,
                }));
              }}
              placeholder="Enter referral / invite reference if applicable"
              className={inputCls}
              disabled={saving}
            />
            <p className="mt-1 text-[10px] leading-snug text-gray-500 dark:text-gray-400">
              This vendor&apos;s public referral code is generated automatically after creation. Use the field above only when you need to set a referral commission %.
            </p>
          </div>

          {referralEntered && (
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Referral Commission (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.referralCommission}
                onChange={set("referralCommission")}
                placeholder="e.g. 0, 1, 2.5"
                className={inputCls}
                disabled={saving}
                required
              />
            </div>
          )}

          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked</span>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-semibold ${isActive ? "text-green-500" : "text-gray-400"}`}>
              {isActive ? "Active" : "Blocked"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving}
            className="rounded-xl bg-green-600 hover:bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
