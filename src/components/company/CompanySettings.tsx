"use client";

import React, { useEffect, useMemo, useState } from "react";
import { copyTextToClipboard } from "@/lib/copy-clipboard";
import { SettingsIcon } from "@/icons/nav-icons";

type CompanyMe = {
  id: string;
  username: string;
  brand_name: string;
  logo: string | null;
  status: string;
  company_code: string | null;
};

function encodeCompanyKey(raw: string): string {
  try {
    return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return raw;
  }
}

export default function CompanySettings() {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [company, setCompany] = useState<CompanyMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/company/me", { credentials: "include" });
        const data = (await res.json()) as { ok?: boolean; company?: CompanyMe; error?: string };
        if (!mounted) return;
        if (!res.ok || !data.ok || !data.company) {
          setLoadError(data.error ?? "Could not load company profile");
          setCompany(null);
          return;
        }
        setCompany(data.company);
      } catch {
        if (mounted) setLoadError("Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const paymentLink = useMemo(() => {
    const code = company?.company_code?.trim() ?? "";
    if (!code || typeof window === "undefined") return "";
    const key = encodeCompanyKey(code);
    return `${window.location.origin}/pay/${key}`;
  }, [company?.company_code]);

  const copyLink = async () => {
    if (!paymentLink) return;
    const ok = await copyTextToClipboard(paymentLink);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1500);
  };

  const copyCompanyCode = async () => {
    const code = company?.company_code?.trim() ?? "";
    if (!code) return;
    const ok = await copyTextToClipboard(code);
    setCopiedCode(ok);
    if (ok) setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <SettingsIcon />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Payment link, QR, and company identifiers. Share the link or QR with customers to collect payments.
          </p>
        </div>
      </div>

      {!loading && !loadError && company && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Company profile</h3>
          </div>
          <dl className="grid gap-3 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{company.brand_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Login</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{company.username}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Company code</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{company.company_code?.trim() || "—"}</span>
                {company.company_code?.trim() ? (
                  <button
                    type="button"
                    onClick={copyCompanyCode}
                    className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  >
                    {copiedCode ? "Copied" : "Copy code"}
                  </button>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-0.5 text-sm capitalize text-gray-900 dark:text-white">{company.status || "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Company Payment Link &amp; QR</h3>
        </div>

        <div className="space-y-4 p-5">
          {loading && <p className="text-sm text-gray-500">Loading payment link...</p>}
          {loadError && <p className="text-sm text-red-600">{loadError}</p>}
          {!loading && !loadError && !company?.company_code && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Company key generated nahi hai. Please admin se contact karein.
            </p>
          )}

          <div className="rounded-xl border border-gray-200 p-4 text-center dark:border-gray-800">
            <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">Scan this QR Code to initiate a payment</p>
            <div className="mx-auto h-44 w-44 rounded-md bg-white p-2 shadow-theme-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentLink || "unavailable")}`}
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
                disabled={!paymentLink}
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
