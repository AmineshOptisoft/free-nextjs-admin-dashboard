"use client";
import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

const STEPS = ["Personal Info", "Account Setup", "Permissions"];

const ROLES = ["Peer User", "Agent", "Merchant", "Sub Admin", "Admin"];
const OP_TYPES = ["PayIn & PayOut", "PayIn Only", "PayOut Only"];
const GATEWAYS = ["UPI & Bank Transfer", "UPI Only", "Bank Transfer Only"];

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-xl">{icon}</span>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );
}

const inputCls = (active?: boolean) =>
  `w-full rounded-full border px-4 py-2.5 text-sm outline-none transition-colors ${
    active
      ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-gray-800 dark:text-gray-200"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
  }`;

const selectCls =
  "w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors appearance-none cursor-pointer";

export default function CreateUserModal({ onClose }: Props) {
  const [step, setStep] = useState(0);

  /* Step 1 — Personal Info */
  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [role,      setRole]      = useState("Peer User");

  /* Step 2 — Account Credentials */
  const [username,     setUsername]     = useState("leo");
  const [password,     setPassword]     = useState("........");
  const [enablePayIn,  setEnablePayIn]  = useState(false);
  const [enablePayOut, setEnablePayOut] = useState(false);

  /* Step 3 — Permissions */
  const [opType,  setOpType]  = useState("PayIn & PayOut");
  const [gateway, setGateway] = useState("UPI & Bank Transfer");
  const [tags,    setTags]    = useState<string[]>(["UPI", "PEER"]);

  const TAG_OPTIONS = ["UPI", "PEER", "PAYIN", "PAYOUT"];
  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create User</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-0 px-6 pt-5 shrink-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  i < step ? "bg-green-500 text-white"
                  : i === step ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 mx-3 h-px transition-colors ${i < step ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50 mt-5">

          {/* ── STEP 0: Personal Information + Account Credentials ── */}
          {step === 0 && (
            <div className="space-y-7">
              {/* Personal Information */}
              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  title="Personal Information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@domain.com" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">User Role</label>
                    <div className="relative">
                      <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                  title="Account Credentials"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className={inputCls(!!username)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className={inputCls(!!password)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enable Pay In</label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={enablePayIn} onChange={(e) => setEnablePayIn(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                        {enablePayIn ? "Yes" : "No"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enable Pay Out</label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={enablePayOut} onChange={(e) => setEnablePayOut(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                        {enablePayOut ? "Yes" : "No"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Account Setup ── */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Account Setup"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Operation Type</label>
                    <div className="relative">
                      <select value={opType} onChange={(e) => setOpType(e.target.value)} className={selectCls}>
                        {OP_TYPES.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gateway</label>
                    <div className="relative">
                      <select value={gateway} onChange={(e) => setGateway(e.target.value)} className={selectCls}>
                        {GATEWAYS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                  title="User Tags"
                />
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((t) => (
                    <button key={t} onClick={() => toggleTag(t)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                        tags.includes(t)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <div className="space-y-5">
              <SectionHeading
                icon={
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Review & Confirm"
              />
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden">
                {[
                  { label: "Full Name",       value: fullName   || "—" },
                  { label: "Email",           value: email      || "—" },
                  { label: "Phone",           value: phone      || "—" },
                  { label: "Role",            value: role },
                  { label: "Username",        value: username   || "—" },
                  { label: "Enable Pay In",   value: enablePayIn  ? "Yes" : "No" },
                  { label: "Enable Pay Out",  value: enablePayOut ? "Yes" : "No" },
                  { label: "Operation Type",  value: opType },
                  { label: "Gateway",         value: gateway },
                  { label: "Tags",            value: tags.length ? tags.join(", ") : "None" },
                ].map((r, i) => (
                  <div key={r.label} className={`flex items-center justify-between px-5 py-3 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-700/30"}`}>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            onClick={() => canPrev && setStep((s) => s - 1)}
            disabled={!canPrev}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              canPrev
                ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-red-500 hover:bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            {canNext ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
              >
                Create User
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
