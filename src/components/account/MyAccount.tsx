"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MyAccountIcon } from "@/icons/nav-icons";

type AccountUser = {
  name: string;
  username: string;
  email: string;
  phone: string;
};

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3.5 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-all">{value}</p>
      </div>
    </div>
  );
}

function initialsFrom(name: string, username: string): string {
  const s = (name || username).trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export default function MyAccount() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");
  const [user, setUser] = useState<AccountUser | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/auth/account", { credentials: "include" });
      const data = (await res.json()) as {
        ok?: boolean;
        role?: string;
        user?: AccountUser;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.user || !data.role) {
        setUser(null);
        setLoadError(data.error ?? "Could not load account.");
        return;
      }
      setUser(data.user);
      setRole(data.role.toUpperCase());
    } catch {
      setUser(null);
      setLoadError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  async function submitPasswordChange() {
    setPwdError(null);
    setPwdSuccess(null);
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPwdError("Fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    setPwdSubmitting(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setPwdError(data.error ?? "Could not update password.");
        return;
      }
      setPwdSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwdError("Network error.");
    } finally {
      setPwdSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <MyAccountIcon />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Account</h1>
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading account…</p>}
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          {loadError}
        </div>
      )}

      {!loading && user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{initialsFrom(user.name, user.username)}</span>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest mt-0.5">{role}</p>
              </div>
            </div>

            <div className="space-y-0">
              <ProfileField
                label="Name"
                value={user.name}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <ProfileField
                label="Username"
                value={user.username}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                }
              />
              <ProfileField
                label="Email"
                value={user.email}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <ProfileField
                label="Phone"
                value={user.phone}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Security</h2>
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFaEnabled((v) => !v)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${
                  twoFaEnabled
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                }`}
              >
                {twoFaEnabled ? "2FA Enabled" : "Enable 2FA"}
              </button>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 px-4 py-3.5">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Two-factor authentication adds a second layer of security by requiring a time-based code from an
                authenticator app (like Google Authenticator or Authy) in addition to your password.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Change Password</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Update your account password regularly for better security (min. 8 characters).
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  />
                </div>
                {pwdError && <p className="text-sm text-red-600 dark:text-red-400">{pwdError}</p>}
                {pwdSuccess && <p className="text-sm text-green-600 dark:text-green-400">{pwdSuccess}</p>}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={pwdSubmitting}
                    onClick={() => void submitPasswordChange()}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
                  >
                    {pwdSubmitting ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
