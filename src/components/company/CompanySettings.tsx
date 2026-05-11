"use client";

import React, { useState } from "react";

export default function CompanySettings() {
  const [copied, setCopied] = useState(false);
  const paymentLink = "http://localhost:1574/pay/U2FsdGVkX19xF3nN0B9VV7TSawFdXZGxKeUw";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Company Payment Link &amp; QR</h3>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-gray-200 p-4 text-center dark:border-gray-800">
            <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">Scan this QR Code to initiate a payment</p>
            <div className="mx-auto h-44 w-44 rounded-md bg-white p-2 shadow-theme-xs">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://localhost:1574/pay/U2FsdGVkX19xF3nN0B9VV7TSawFdXZGxKeUw"
                alt="Payment QR"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Your Unique Payment Link:
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={paymentLink}
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
              />
              <button
                onClick={copyLink}
                className="inline-flex h-10 items-center rounded-lg border border-brand-200 px-3 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900/20"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
