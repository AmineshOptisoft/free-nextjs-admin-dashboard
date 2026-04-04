"use client";

import React, { useState, useContext, useEffect } from "react";
import ForgotPasswordOtpForm from "@/components/auth/ForgotPasswordOtpForm";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";

type Props = {
  mode: "login" | "signup";
  open: boolean;
  onClose: () => void;
  pendingPath?: string;
};

function normPhone(p: string) {
  return String(p).trim().replace(/\s+/g, "");
}
function isEmailInput(value: string) {
  return String(value).includes("@");
}

export default function UserAuthModal({ mode, open, onClose, pendingPath }: Props) {
  const router = useRouter();
  const { refreshUser } = useContext(UserContext) as any;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (open) setShowForgot(false);
  }, [open]);

  if (!open) return null;

  const saveSession = (customerId: number, token?: string) => {
    localStorage.setItem("sim_customer_id", String(customerId));
    if (token) localStorage.setItem("sim_customer_token", token);
    refreshUser();
  };

  const loginCustomer = async (withNewPassword?: string) => {
    const payload: Record<string, string> = { password };
    if (isEmailInput(phone)) payload.email = String(phone).trim().toLowerCase();
    else payload.phone = normPhone(phone);
    if (withNewPassword || (requiresPasswordSetup && newPassword)) {
      payload.newPassword = withNewPassword || newPassword;
    }
    const res = await fetch("/api/customer-app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data?.requiresPasswordSetup) {
        setRequiresPasswordSetup(true);
        setError("Pehli baar: naya password set karein (min 6 characters).");
        return;
      }
      setError(data?.error || "Login failed");
      return;
    }
    saveSession(data.customer.id, data.token);
    setRequiresPasswordSetup(false);
    setNewPassword("");
    onClose();
    if (pendingPath) router.push(pendingPath);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      if (isEmailInput(phone)) {
        await loginCustomer();
        return;
      }
      const roleRes = await fetch("/api/auth/find-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normPhone(phone) }),
      });
      const roleData = await roleRes.json();

      if (!roleData.found) {
        setError("Account not found. Please sign up first.");
        setLoading(false);
        return;
      }

      if (roleData.role === "rider") {
        localStorage.setItem("sim_rider_phone", roleData.data.phone);
        onClose();
        router.push("/rider");
        setLoading(false);
        return;
      }

      if (roleData.role === "customer") {
        await loginCustomer();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !phone.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer-app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail.trim(),
          phone: normPhone(phone),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setLoading(false);
        return;
      }
      await loginCustomer();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close auth modal"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {mode === "login" ? "Customer Login" : "Create account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            Close
          </button>
        </div>

        {mode === "login" ? (
          showForgot ? (
            <div className="mt-5">
              <ForgotPasswordOtpForm
                role="customer"
                onCancel={() => setShowForgot(false)}
                onSuccess={() => setShowForgot(false)}
              />
            </div>
          ) : (
            <>
              <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <div>
                  <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210 or name@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                  />
                </div>
                {requiresPasswordSetup && (
                  <div>
                    <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                      Set new password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required={requiresPasswordSetup}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading ? "Please wait..." : requiresPasswordSetup ? "Set password & continue" : "Login"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="mt-3 w-full text-center text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Forgot password?
              </button>
            </>
          )
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSignupSubmit}>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">First name</label>
                <input
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Last name</label>
                <input
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
