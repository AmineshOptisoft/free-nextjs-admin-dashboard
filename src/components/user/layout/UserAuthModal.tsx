"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode: "login" | "signup";
  open: boolean;
  onClose: () => void;
};

export default function UserAuthModal({ mode, open, onClose }: Props) {
  const router = useRouter();

  if (!open) return null;

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
            {mode === "login" ? "Login" : "Sign Up"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            Close
          </button>
        </div>

        <form className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/user/orders");
            }}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            {mode === "login" ? "Continue Login" : "Create Account"}
          </button>
          <button
            type="button"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
