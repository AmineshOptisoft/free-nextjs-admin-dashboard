"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "../ui/Pagination";
import LogoImagePicker from "./LogoImagePicker";

/* ── Types ── */
type TxStatus = "NOT_ASSIGNED" | "PENDING" | "APPROVED" | "EXPIRED" | "FAILED";

interface Transaction {
  id: string;
  date: string;
  orderId: string;
  payer: string;
  amount: number;
  status: TxStatus;
}

const txStatusStyle: Record<TxStatus, string> = {
  NOT_ASSIGNED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PENDING:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  APPROVED:     "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  EXPIRED:      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  FAILED:       "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
};

/* ── Mock data helpers ── */
function getMockTransactions(id: string): Transaction[] {
  return [
    { id:"1", date:"5/8/2026\n04:07 PM", orderId:`ORD-${id}778236678249-49671`, payer:"werdftghyj", amount:123456, status:"NOT_ASSIGNED" },
    { id:"2", date:"5/8/2026\n02:30 PM", orderId:`ORD-${id}885512345678-11200`, payer:"rajesh_k",   amount:5000,   status:"APPROVED" },
    { id:"3", date:"5/7/2026\n11:15 AM", orderId:`ORD-${id}990123456789-33400`, payer:"anita_vp",   amount:2500,   status:"PENDING" },
    { id:"4", date:"5/7/2026\n09:00 AM", orderId:`ORD-${id}110234567890-55600`, payer:"mohan_d",    amount:7800,   status:"EXPIRED" },
    { id:"5", date:"5/6/2026\n03:45 PM", orderId:`ORD-${id}220345678901-77800`, payer:"sunita_fp",  amount:1500,   status:"FAILED" },
    { id:"6", date:"5/6/2026\n01:00 PM", orderId:`ORD-${id}330456789012-99000`, payer:"deepak_vip", amount:9900,   status:"APPROVED" },
  ];
}

/* ── Faux QR Code ── */
function QrPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-5">
      <svg viewBox="0 0 80 80" className="w-36 h-36" fill="none">
        <rect x="4"  y="4"  width="20" height="20" rx="2" fill="#1e293b" />
        <rect x="7"  y="7"  width="14" height="14" rx="1" fill="white" />
        <rect x="10" y="10" width="8"  height="8"  rx="0.5" fill="#1e293b" />
        <rect x="56" y="4"  width="20" height="20" rx="2" fill="#1e293b" />
        <rect x="59" y="7"  width="14" height="14" rx="1" fill="white" />
        <rect x="62" y="10" width="8"  height="8"  rx="0.5" fill="#1e293b" />
        <rect x="4"  y="56" width="20" height="20" rx="2" fill="#1e293b" />
        <rect x="7"  y="59" width="14" height="14" rx="1" fill="white" />
        <rect x="10" y="62" width="8"  height="8"  rx="0.5" fill="#1e293b" />
        {[30,34,38,42,46,50,54,58,62,66,70].map((x) =>
          [30,34,38,42,46,50,54,58,62,66,70].map((y) =>
            (x + y) % 8 < 5
              ? <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill="#1e293b" />
              : null
          )
        )}
      </svg>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Scan to Pay</p>
    </div>
  );
}

const TX_PAGE_SIZE = 5;

type ApiCompany = {
  id: string;
  username: string;
  brand_name: string;
  logo: string | null;
  status: string;
  company_code: string | null;
  commission: number;
  net_pay_in: number;
  net_pay_out: number;
  settlement_amount: number;
};

/* ── Main component ── */
export default function CompanyDetail({ id }: { id: string }) {
  const [apiCompany, setApiCompany] = useState<ApiCompany | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const uploadLogoFile = useCallback(
    async (file: File) => {
      let blobUrl: string | null = null;
      setUploadError(null);
      setUploadingLogo(true);
      try {
        blobUrl = URL.createObjectURL(file);
        setPendingPreview(blobUrl);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/companies/${id}/logo`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const data = (await res.json()) as { ok?: boolean; logo?: string; error?: string };
        if (!res.ok || !data.ok || !data.logo) {
          setUploadError(data.error ?? "Upload failed.");
          return;
        }
        setApiCompany((prev) => (prev ? { ...prev, logo: data.logo as string } : null));
      } catch {
        setUploadError("Network error.");
      } finally {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        setPendingPreview(null);
        setUploadingLogo(false);
      }
    },
    [id],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(null);
      setApiCompany(null);
      if (!id || id === "undefined") {
        setLoadError("Invalid company link.");
        return;
      }
      try {
        const res = await fetch(`/api/companies/${id}`, { credentials: "include" });
        const data = (await res.json()) as { ok?: boolean; company?: ApiCompany; error?: string };
        if (cancelled) return;
        if (res.status === 404) {
          setLoadError("Company not found.");
          return;
        }
        if (!res.ok || !data.ok || !data.company) {
          setLoadError(data.error ?? "Could not load company.");
          return;
        }
        setApiCompany(data.company);
      } catch {
        if (!cancelled) setLoadError("Network error.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const transactions = getMockTransactions(id);
  const securityKey = `987C3914B${id}026696`;

  const txPaginated = transactions.slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE);
  const todayPayIn = transactions.filter((t) => t.status === "APPROVED").reduce((s, t) => s + t.amount, 0);
  const todayPayOut = 0;

  const brandSlug = (apiCompany?.brand_name || "company").toLowerCase().replace(/\s+/g, "-");
  const paymentLink = `https://pay.tepay.in/${brandSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadError && !apiCompany) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/companies" className="text-sm text-brand-500 hover:underline w-fit">
          ← Back to companies
        </Link>
        <p className="text-gray-600 dark:text-gray-400">{loadError}</p>
      </div>
    );
  }

  if (!apiCompany) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  const company = apiCompany;
  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <Link
          href="/companies"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Company <span className="text-blue-500">Details</span>
        </h1>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">

        {/* ── Left: Profile card ── */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Logo + profile */}
          <div className="flex flex-col items-center pt-8 pb-5 px-5 border-b border-gray-100 dark:border-gray-800">
            <LogoImagePicker
              previewSrc={
                pendingPreview ??
                (company.logo && (company.logo.startsWith("http") || company.logo.startsWith("/"))
                  ? company.logo
                  : null)
              }
              onFile={uploadLogoFile}
              uploading={uploadingLogo}
            />
            {uploadError && <p className="text-xs text-red-500 text-center max-w-[220px] mt-1">{uploadError}</p>}
            <p className="text-base font-bold text-gray-900 dark:text-white mt-3">{company.username}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Brand: {company.brand_name || "—"}</p>
          </div>

          {/* Info fields */}
          <div className="px-5 py-4 flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800">
            {[
              { label: "Status", value: company.status },
              { label: "Company code", value: company.company_code || "—" },
              { label: "Commission", value: `${Number(company.commission) || 0}%` },
              { label: "Net pay-in", value: `₹${company.net_pay_in.toLocaleString("en-IN")}` },
              { label: "Net pay-out", value: `₹${company.net_pay_out.toLocaleString("en-IN")}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Security Key</p>
              <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 tracking-widest break-all">
                {securityKey}
              </p>
            </div>
          </div>

          {/* QR / Payment portal */}
          <div className="px-5 py-5">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Public Payment Portal</p>
            <QrPlaceholder />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 flex-1 justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={paymentLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <button className="w-full mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Download QR Image
            </button>
          </div>
        </div>

        {/* ── Right: Transaction History ── */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Transaction History</h2>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Total Pay-In (Today)</p>
                <p className={`text-sm font-bold ${todayPayIn > 0 ? "text-green-500" : "text-red-500"}`}>
                  ₹{todayPayIn.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">Total Pay-Out (Today)</p>
                <p className={`text-sm font-bold ${todayPayOut > 0 ? "text-green-500" : "text-red-500"}`}>
                  ₹{todayPayOut.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
                  {["Date", "Order ID", "Payer", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txPaginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-gray-400">No transactions found.</td>
                  </tr>
                ) : (
                  txPaginated.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        {tx.date.split("\n").map((line, i) => (
                          <p key={i} className={`text-xs ${i === 0 ? "font-medium text-gray-700 dark:text-gray-200" : "text-gray-400"}`}>{line}</p>
                        ))}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all max-w-[160px]">{tx.orderId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{tx.payer}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${txStatusStyle[tx.status]}`}>
                          {tx.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button title="View transaction" className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button title="Process / assign" className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-500 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
            <p className="text-xs text-gray-400 shrink-0">
              {transactions.length === 0
                ? "No entries"
                : `Showing ${(txPage - 1) * TX_PAGE_SIZE + 1} to ${Math.min(txPage * TX_PAGE_SIZE, transactions.length)} of ${transactions.length} entries`}
            </p>
            <Pagination total={transactions.length} page={txPage} pageSize={TX_PAGE_SIZE} onPageChange={setTxPage} />
          </div>
        </div>

      </div>
    </div>
  );
}
