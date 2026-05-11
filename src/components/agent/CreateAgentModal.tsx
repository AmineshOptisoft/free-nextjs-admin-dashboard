"use client";
import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function CreateAgentModal({ onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [form, setForm] = useState({
    name: "", username: "", password: "",
    securityDeposit: "", creditLimit: "",
    payinCommission: "", payoutCommission: "", referralCode: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="w-4.5 h-4.5 text-green-600 dark:text-green-400" style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Agent</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Name</label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Enter name" className={inputCls} />
          </div>

          {/* Username */}
          <div>
            <label className={labelCls}>Username</label>
            <input type="text" value={form.username} onChange={set("username")} placeholder="Enter username" className={inputCls} />
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Enter password"
                className={`${inputCls} pr-12`}
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

          {/* Security Deposit */}
          <div>
            <label className={labelCls}>Security Deposit</label>
            <input type="number" value={form.securityDeposit} onChange={set("securityDeposit")} placeholder="Enter security deposit amount" className={inputCls} />
          </div>

          {/* Credit Limit */}
          <div>
            <label className={labelCls}>Credit Limit</label>
            <input type="number" value={form.creditLimit} onChange={set("creditLimit")} placeholder="Enter total PayIn limit" className={inputCls} />
          </div>

          {/* PayIn Commission */}
          <div>
            <label className={labelCls}>PayIn Commission (%)</label>
            <input type="text" value={form.payinCommission} onChange={set("payinCommission")} placeholder="e.g. 0.6, 2, 3" className={inputCls} />
          </div>

          {/* PayOut Commission */}
          <div>
            <label className={labelCls}>PayOut Commission (%)</label>
            <input type="text" value={form.payoutCommission} onChange={set("payoutCommission")} placeholder="e.g. 0.1, 1.5" className={inputCls} />
          </div>

          {/* Referral Code */}
          <div>
            <label className={labelCls}>Referral Code <span className="normal-case font-normal text-gray-400">(Optional)</span></label>
            <input type="text" value={form.referralCode} onChange={set("referralCode")} placeholder="Enter 10-digit referral code" className={inputCls} maxLength={10} />
          </div>

          {/* Blocked / Active toggle — full-width */}
          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked</span>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-semibold ${isActive ? "text-green-500" : "text-gray-400"}`}>
              {isActive ? "Active" : "Blocked"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button className="rounded-xl bg-green-600 hover:bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
