"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/user/landing/HeroSection";
import HowItWorksSection from "@/components/user/landing/HowItWorksSection";
import FeaturesSection from "@/components/user/landing/FeaturesSection";
import { UserContext } from "./layout";
import ForgotPasswordOtpForm from "@/components/auth/ForgotPasswordOtpForm";

function normPhone(p: string) {
  return String(p).trim().replace(/\s+/g, "");
}
function isEmailInput(value: string) {
  return String(value).includes("@");
}

export default function UserLandingPage() {
  const { user: activeUser, refreshUser } = useContext(UserContext) as any;
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [loginStep, setLoginStep] = useState<"phone" | "register">("phone");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const saveSession = (customerId: number, token?: string) => {
    localStorage.setItem("sim_customer_id", String(customerId));
    if (token) localStorage.setItem("sim_customer_token", token);
    refreshUser();
  };

  const tryLogin = async () => {
    const payload: Record<string, string> = { password: loginPassword };
    if (isEmailInput(loginPhone)) payload.email = String(loginPhone).trim().toLowerCase();
    else payload.phone = normPhone(loginPhone);
    if (requiresPasswordSetup && newPassword) {
      payload.newPassword = newPassword;
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
        setError("First login: set a new password below (minimum 6 characters).");
        return;
      }
      setError(data?.error || "Login failed");
      return;
    }
    saveSession(data.customer.id, data.token);
    setRequiresPasswordSetup(false);
    setNewPassword("");
    setError("");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEmailInput(loginPhone)) {
        await tryLogin();
        return;
      }
      const roleRes = await fetch("/api/auth/find-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normPhone(loginPhone) }),
      });
      const roleData = await roleRes.json();

      if (!roleData.found) {
        setLoginStep("register");
        setLoading(false);
        return;
      }

      if (roleData.role === "rider") {
        localStorage.setItem("sim_rider_phone", roleData.data.phone);
        window.location.href = "/rider";
        return;
      }

      await tryLogin();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer-app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail.trim(),
          phone: normPhone(loginPhone),
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setLoading(false);
        return;
      }
      setLoginPassword(regPassword);
      await tryLoginWithPassword(regPassword);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tryLoginWithPassword = async (pwd: string) => {
    const res = await fetch("/api/customer-app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normPhone(loginPhone),
        password: pwd,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      saveSession(data.customer.id, data.token);
      setError("");
    } else {
      setError(data?.error || "Login after register failed");
    }
  };

  return (
    <div className="space-y-10">
      {activeUser ? (
        <div className="p-4 bg-brand-500 rounded-2xl text-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {activeUser.firstName?.charAt(0) ?? "😊"}
            </div>
            <div>
              <h2 className="text-xl font-bold">Hello, {activeUser.firstName}!</h2>
              <p className="text-sm opacity-80">Welcome back to Kadi EV Fleet.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/user/dashboard"
              className="bg-white text-brand-600 hover:bg-white/90 px-4 py-2 rounded-xl text-sm font-bold transition-all text-center"
            >
              Dashboard
            </Link>
            <Link
              href="/user/orders"
              className="bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl text-sm font-bold transition-all text-center"
            >
              My Orders
            </Link>
            <Link
              href="/user/book-ride"
              className="bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl text-sm font-bold transition-all text-center"
            >
              Book a Ride
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Access Your Profile</h2>
          {error && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {loginStep === "phone" ? (
            showForgotPassword ? (
              <div className="max-w-md">
                <ForgotPasswordOtpForm
                  role="customer"
                  onCancel={() => setShowForgotPassword(false)}
                  onSuccess={() => setShowForgotPassword(false)}
                />
              </div>
            ) : (
              <>
                <form onSubmit={handlePhoneSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Email or phone number</label>
                    <input
                      required
                      type="text"
                      placeholder="9876543210 or name@example.com"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Password</label>
                    <input
                      required
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                  </div>
                  {requiresPasswordSetup && (
                    <div>
                      <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                        Set new password (min 6 characters)
                      </label>
                      <input
                        required
                        minLength={6}
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? "Please wait..." : requiresPasswordSetup ? "Set password & login" : "Continue"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="mt-3 max-w-md w-full text-center text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Forgot password?
                </button>
              </>
            )
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md">
              <p className="text-sm text-gray-500">
                Account nahi mila <strong>{loginPhone}</strong>. Naya account banayein.
              </p>
              <div className="flex gap-3">
                <input
                  required
                  type="text"
                  placeholder="First name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                <input
                  required
                  type="text"
                  placeholder="Last name"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Password</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create & login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginStep("phone");
                  setError("");
                }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      )}
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Ready to place your next delivery order?
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start now and get your order delivered by our e-bike network.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/book-ride"
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Book a ride
          </Link>
          <Link
            href="/user/dashboard"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
