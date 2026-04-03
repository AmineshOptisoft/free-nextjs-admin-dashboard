"use client";

import React, { useState } from "react";

function normPhone(p: string) {
  return String(p).trim().replace(/\s+/g, "");
}

type Role = "customer" | "rider";

type Props = {
  role: Role;
  onCancel: () => void;
  /** Called after successful password reset */
  onSuccess?: () => void;
  className?: string;
};

export default function ForgotPasswordOtpForm({ role, onCancel, onSuccess, className = "" }: Props) {
  const [step, setStep] = useState<"send" | "reset">("send");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const base = role === "customer" ? "/api/customer-app/auth" : "/api/rider-app/auth";

  const buildIdentifierBody = () => {
    const v = contact.trim();
    if (v.includes("@")) return { email: v.toLowerCase() };
    return { phone: normPhone(v) };
  };

  const buildResetBody = () => ({
    ...buildIdentifierBody(),
    otp: otp.trim(),
    newPassword,
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!contact.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildIdentifierBody()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to send OTP");
        return;
      }
      setInfo(data?.message || "Check your email for the OTP.");
      setStep("reset");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!otp.trim() || newPassword.length < 6) {
      setError("OTP and new password (minimum 6 characters) are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${base}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildResetBody()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Reset failed");
        return;
      }
      setInfo("Password reset successful. Please log in with your new password.");
      onSuccess?.();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-900/20 ${className}`}>
      <p className="text-sm font-semibold text-gray-800 dark:text-white">
        Forgot password (email OTP)
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        OTP will be sent to the email linked to this account. Make sure your account has a valid email address.
      </p>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {info && <p className="mt-2 text-xs text-green-700 dark:text-green-400">{info}</p>}

      {step === "send" ? (
        <form onSubmit={handleSendOtp} className="mt-3 space-y-3">
          <input
            type="text"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or registered email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "..." : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
            >
              Back
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="mt-3 space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit OTP"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "..." : "Password reset"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("send");
                setOtp("");
                setNewPassword("");
                setError("");
                setInfo("");
              }}
              className="rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600"
            >
              Back
            </button>
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600">
              Close
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
