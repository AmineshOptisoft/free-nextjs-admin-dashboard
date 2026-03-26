import React from "react";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Update your account password securely.
      </p>
      <form className="mt-6 space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
        />
        <button
          type="button"
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Save Password
        </button>
      </form>
    </div>
  );
}
