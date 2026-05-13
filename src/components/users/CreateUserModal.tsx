"use client";
import React, { useEffect, useState } from "react";

/** Edit payload for a row from `GET /api/agent/staff` (`payment_methods` items). */
export type PaymentMethodEditPayload = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  username: string;
  enablePayIn: boolean;
  enablePayOut: boolean;
  opType: string;
  gateway: string;
  upiId: string;
  accountHolderName: string;
  bankAccountHolder: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
};

/** @deprecated Use `PaymentMethodEditPayload` */
export type AgentStaffEditPayload = PaymentMethodEditPayload;

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  editPaymentMethod?: PaymentMethodEditPayload | null;
};

const STEPS = ["Personal & login", "Payment details", "Review"];

const ROLES = ["Peer User", "Vendor", "Merchant", "Sub Admin", "Admin"];
const OP_TYPES = ["PayIn & PayOut", "PayIn Only", "PayOut Only"];

type MethodChannel = "UPI" | "BANK";

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

function channelFromGateway(gw: string): MethodChannel {
  return gw === "Bank Transfer Only" ? "BANK" : "UPI";
}

export default function CreateUserModal({ onClose, onSuccess, editPaymentMethod }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Peer User");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enablePayIn, setEnablePayIn] = useState(false);
  const [enablePayOut, setEnablePayOut] = useState(false);

  const [opType, setOpType] = useState("PayIn & PayOut");
  const [methodChannel, setMethodChannel] = useState<MethodChannel>("UPI");
  const [upiAccountName, setUpiAccountName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    setErr(null);
    if (editPaymentMethod) {
      setFullName(editPaymentMethod.fullname);
      setEmail(editPaymentMethod.email);
      setPhone(editPaymentMethod.phone);
      setRole(editPaymentMethod.role);
      setUsername(editPaymentMethod.username);
      setPassword("");
      setEnablePayIn(editPaymentMethod.enablePayIn);
      setEnablePayOut(editPaymentMethod.enablePayOut);
      setOpType(editPaymentMethod.opType);
      const ch = channelFromGateway(editPaymentMethod.gateway);
      setMethodChannel(ch);
      setUpiId(editPaymentMethod.upiId ?? "");
      setUpiAccountName(
        ch === "UPI" ? (editPaymentMethod.accountHolderName ?? "") : "",
      );
      setBankName(editPaymentMethod.bankName ?? "");
      setBankAccountHolder(ch === "BANK" ? (editPaymentMethod.bankAccountHolder ?? "") : "");
      setAccountNo(editPaymentMethod.accountNo ?? "");
      setIfscCode(editPaymentMethod.ifscCode ?? "");
      setBranchName(editPaymentMethod.branchName ?? "");
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("Peer User");
      setUsername("");
      setPassword("");
      setEnablePayIn(false);
      setEnablePayOut(false);
      setOpType("PayIn & PayOut");
      setMethodChannel("UPI");
      setUpiAccountName("");
      setUpiId("");
      setBankName("");
      setBankAccountHolder("");
      setAccountNo("");
      setIfscCode("");
      setBranchName("");
    }
    setStep(0);
  }, [editPaymentMethod]);

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  const gatewayForApi = methodChannel === "BANK" ? "Bank Transfer Only" : "UPI Only";

  function validateStep0(): string | null {
    if (!username.trim()) return "Username is required.";
    return null;
  }

  function validateStep1(): string | null {
    if (methodChannel === "UPI") {
      if (!upiId.trim()) return "Enter the UPI ID (e.g. name@paytm).";
      return null;
    }
    if (!bankName.trim() || !accountNo.trim() || !ifscCode.trim() || !bankAccountHolder.trim()) {
      return "For bank, fill bank name, account number, IFSC, and account holder name.";
    }
    return null;
  }

  function goNext() {
    setErr(null);
    if (step === 0) {
      const e = validateStep0();
      if (e) {
        setErr(e);
        return;
      }
    }
    if (step === 1) {
      const e = validateStep1();
      if (e) {
        setErr(e);
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function handleFinalSubmit() {
    setErr(null);
    const u = username.trim();
    if (!u) {
      setErr("Username is required.");
      return;
    }
    const v1 = validateStep1();
    if (v1) {
      setErr(v1);
      return;
    }

    const accountHolderForApi =
      methodChannel === "UPI" ? upiAccountName.trim() || null : bankAccountHolder.trim();

    setSaving(true);
    try {
      const payload = {
        fullname: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role_label: role,
        username: u,
        pay_in_enabled: enablePayIn,
        pay_out_enabled: enablePayOut,
        operation_type: opType,
        gateway: gatewayForApi,
        upi_id: methodChannel === "UPI" ? upiId.trim() : "",
        bank_name: methodChannel === "BANK" ? bankName.trim() : "",
        account_no: methodChannel === "BANK" ? accountNo.trim() : "",
        ifsc_code: methodChannel === "BANK" ? ifscCode.trim() : "",
        branch_name: methodChannel === "BANK" ? branchName.trim() : "",
        account_holder_name: accountHolderForApi ?? "",
      };

      if (editPaymentMethod) {
        const body: Record<string, unknown> = { ...payload };
        if (password) body.password = password;
        const res = await fetch(`/api/agent/staff/${editPaymentMethod.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setErr(data.error ?? "Could not update payment method.");
          return;
        }
      } else {
        const res = await fetch("/api/agent/staff", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, password }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setErr(data.error ?? "Could not create payment method.");
          return;
        }
      }
      onSuccess?.();
      onClose();
    } catch {
      setErr("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const title = editPaymentMethod ? "Edit payment method" : "Add payment method";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50 mt-5">
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {err}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-7">
              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  title="Personal information"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@domain.com" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label / role</label>
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

              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                  title="Login for this payment method"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className={inputCls(!!username)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Password {editPaymentMethod ? "(optional — leave blank to keep)" : "(optional)"}
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={editPaymentMethod ? "Leave blank to keep" : "Optional"}
                      autoComplete="new-password"
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
                  title="Operation type"
                />
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">How this method is used</label>
                  <div className="relative">
                    <select value={opType} onChange={(e) => setOpType(e.target.value)} className={selectCls}>
                      {OP_TYPES.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                  title="Account type"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Choose UPI or bank. We will ask for the matching details below.</p>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { id: "UPI" as const, label: "UPI", sub: "Then UPI ID" },
                      { id: "BANK" as const, label: "Bank", sub: "Then bank details" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setMethodChannel(opt.id);
                        setErr(null);
                      }}
                      className={`rounded-2xl border px-5 py-3 text-left transition-colors ${
                        methodChannel === opt.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {methodChannel === "UPI" ? (
                <div className="space-y-4">
                  <SectionHeading
                    icon={
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title="UPI details"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name on UPI (optional)</label>
                      <input type="text" value={upiAccountName} onChange={(e) => setUpiAccountName(e.target.value)}
                        placeholder="Display / account name" className={inputCls()} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">UPI ID <span className="text-red-500">*</span></label>
                      <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. merchant@okaxis" className={inputCls(!!upiId)} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                <SectionHeading
                  icon={
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  title="Bank details"
                />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bank name <span className="text-red-500">*</span></label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. State Bank of India" className={inputCls(!!bankName)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account holder name <span className="text-red-500">*</span></label>
                      <input type="text" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)}
                        placeholder="As per bank records" className={inputCls(!!bankAccountHolder)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account number <span className="text-red-500">*</span></label>
                      <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)}
                        className={inputCls(!!accountNo)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">IFSC <span className="text-red-500">*</span></label>
                      <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234" className={inputCls(!!ifscCode)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Branch (optional)</label>
                      <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)}
                        className={inputCls()} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <SectionHeading
                icon={
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Review"
              />
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden">
                {[
                  { label: "Full name", value: fullName || "—" },
                  { label: "Email", value: email || "—" },
                  { label: "Phone", value: phone || "—" },
                  { label: "Label / role", value: role },
                  { label: "Username", value: username || "—" },
                  { label: "Enable Pay In", value: enablePayIn ? "Yes" : "No" },
                  { label: "Enable Pay Out", value: enablePayOut ? "Yes" : "No" },
                  { label: "Operation type", value: opType },
                  { label: "Method", value: methodChannel === "UPI" ? "UPI" : "Bank transfer" },
                  ...(methodChannel === "UPI"
                    ? [
                        { label: "Name on UPI", value: upiAccountName || "—" },
                        { label: "UPI ID", value: upiId || "—" },
                      ]
                    : [
                        { label: "Bank", value: bankName || "—" },
                        { label: "Account holder", value: bankAccountHolder || "—" },
                        { label: "Account no.", value: accountNo || "—" },
                        { label: "IFSC", value: ifscCode || "—" },
                        { label: "Branch", value: branchName || "—" },
                      ]),
                ].map((r, i) => (
                  <div key={r.label} className={`flex items-center justify-between px-5 py-3 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-700/30"}`}>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-right max-w-[55%] break-all">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            type="button"
            onClick={() => canPrev && !saving && setStep((s) => s - 1)}
            disabled={!canPrev || saving}
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
                type="button"
                disabled={saving}
                onClick={() => goNext()}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
              >
                Next step
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleFinalSubmit()}
                className="rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
              >
                {saving ? "Saving…" : editPaymentMethod ? "Save changes" : "Create payment method"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
