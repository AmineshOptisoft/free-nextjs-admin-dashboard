"use client";

import React from "react";
import Link from "next/link";
import ForgotPasswordOtpForm from "@/components/auth/ForgotPasswordOtpForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Forgot password</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registered phone ya email se OTP maangein; OTP aapke account wale email par bheja jayega (Nodemailer).
        </p>
      </div>
      <ForgotPasswordOtpForm
        role="customer"
        onCancel={() => {
          if (typeof window !== "undefined") window.history.back();
        }}
      />
      <p className="text-center text-sm">
        <Link href="/user" className="text-brand-600 hover:underline dark:text-brand-400">
          ← Home / Login
        </Link>
      </p>
    </div>
  );
}
