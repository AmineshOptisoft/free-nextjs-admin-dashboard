"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/(user)/user/layout";

type Props = {
  mode: "login" | "signup";
  open: boolean;
  onClose: () => void;
  pendingPath?: string;
};

export default function UserAuthModal({ mode, open, onClose, pendingPath }: Props) {
  const router = useRouter();
  const { refreshUser } = useContext(UserContext) as any;
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/find-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.found) {
        if (data.role === "rider") {
          localStorage.setItem("sim_rider_phone", data.data.phone); 
          onClose();
          router.push("/rider");
        } else if (data.role === "customer") {
          localStorage.setItem("sim_customer_id", data.data.id.toString());
          refreshUser();
          onClose();
          if (pendingPath) {
             router.push(pendingPath);
          }
        }
      } else {
        setError("Account not found. Please register first on the homepage.");
      }
    } catch (err) {
      setError("An error occurred");
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
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {mode === "login" ? "Login" : "Sign Up"} with Number
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            Close
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
