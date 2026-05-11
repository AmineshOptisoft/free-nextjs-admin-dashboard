"use client";
import React, { useRef, useState } from "react";

interface Props {
  onClose: () => void;
}

export default function CreateCompanyModal({ onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [activateNow, setActivateNow] = useState(true);
  const [logoFile, setLogoFile] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "", email: "", password: "", commission: "", brandName: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Company Account</h2>
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
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company Username</label>
              <input type="text" value={form.username} onChange={set("username")} placeholder="Enter unique username" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="company@example.com" className={inputCls} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Login Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter strong password"
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
            <div>
              <label className={labelCls}>Commission (%)</label>
              <input type="text" value={form.commission} onChange={set("commission")} placeholder="Enter commission percentage" className={inputCls} />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Brand Name</label>
              <input type="text" value={form.brandName} onChange={set("brandName")} placeholder="Enter brand name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company Logo</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors whitespace-nowrap"
                >
                  Choose Logo
                </button>
                <span className="text-sm text-gray-400 dark:text-gray-500 truncate">
                  {logoFile || "No file selected"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0]?.name ?? "")}
                />
              </div>
            </div>
          </div>

          {/* Activate immediately toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 px-4 py-4 mt-1">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-0.5">Activate Account Immediately</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                If active, the company can start using the system right away. Otherwise, it will remain pending.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivateNow((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${activateNow ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${activateNow ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button className="rounded-xl bg-green-600 hover:bg-green-700 px-7 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
