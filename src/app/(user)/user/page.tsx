"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/user/landing/HeroSection";
import HowItWorksSection from "@/components/user/landing/HowItWorksSection";
import FeaturesSection from "@/components/user/landing/FeaturesSection";
import { UserContext } from "./layout";

export default function UserLandingPage() {
  const { user: activeUser, refreshUser } = useContext(UserContext) as any;
  const [loginPhone, setLoginPhone] = useState("");
  const [loginStep, setLoginStep] = useState<"phone" | "register">("phone");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/customers/find-by-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: loginPhone })
    });
    const data = await res.json();
    if (data.found) {
      localStorage.setItem("sim_customer_id", data.customer.id.toString());
      refreshUser();
    } else {
      setLoginStep("register");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: regFirstName, lastName: regLastName, email: regEmail, phone: loginPhone })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("sim_customer_id", data.id.toString());
      refreshUser();
    } else {
      alert("Registration failed.");
    }
  };

  return (
    <div className="space-y-10">
      {activeUser ? (
        <div className="p-4 bg-brand-500 rounded-2xl text-white flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">😊</div>
              <div>
                <h2 className="text-xl font-bold">Hello, {activeUser.firstName}!</h2>
                <p className="text-sm opacity-80">Welcome back to Kadi EV Fleet.</p>
              </div>
           </div>
           <Link href="/user/orders" className="bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl text-sm font-bold transition-all">
              View My Orders
           </Link>
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Access Your Profile</h2>
          {loginStep === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="tel"
                placeholder="Enter Mobile Number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <button type="submit" className="py-3 px-6 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md">
              <p className="text-sm text-gray-500">Profile not found for {loginPhone}. Create your profile to continue.</p>
              <div className="flex gap-3">
                <input required type="text" placeholder="First Name" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700" />
                <input required type="text" placeholder="Last Name" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700" />
              </div>
              <input required type="email" placeholder="Email Address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700" />
              <button type="submit" className="w-full py-3 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl">
                Create & Continue
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
            href="/user/orders"
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Order Now
          </Link>
          <Link
            href="/user/track"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Track Order
          </Link>
        </div>
      </section>
    </div>
  );
}
