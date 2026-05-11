"use client";
import React, { useState } from "react";
import DateRangePicker, { DateRange } from "../dashboard/DateRangePicker";
import { PieChartIcon } from "@/icons";
import { IoDocumentText } from "react-icons/io5";

type ReportType = "payin" | "payout" | "dispute" | "settlement";

interface Report {
  id: string;
  name: string;
  type: ReportType;
  generatedBy: string;
  createdOn: string;
}

const mockReports: Report[] = [
  { id: "1", name: "PAYIN Report For Leo Admin",        type: "payin",      generatedBy: "leodeposit", createdOn: "Fri 08 May 2026, 10:33" },
  { id: "2", name: "PAYOUT Report For Leo Admin",       type: "payout",     generatedBy: "leodeposit", createdOn: "Fri 08 May 2026, 09:15" },
  { id: "3", name: "May 2026 Settlement Report",        type: "settlement", generatedBy: "leo_admin",  createdOn: "Thu 07 May 2026, 18:45" },
  { id: "4", name: "Dispute Summary – Apr 2026",        type: "dispute",    generatedBy: "leo_admin",  createdOn: "Wed 06 May 2026, 14:20" },
  { id: "5", name: "2026-04 - 2026-05 PayIn Report",    type: "payin",      generatedBy: "leodeposit", createdOn: "Tue 05 May 2026, 11:00" },
];

const typeStyle: Record<ReportType, string> = {
  payin:      "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  payout:     "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  dispute:    "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
  settlement: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_OPTIONS   = ["All", "Approved", "Pending", "Failed", "Expired"];
const REPORT_TYPES     = ["PayIn", "PayOut", "Dispute", "Settlement"];
const USER_OPTIONS     = ["leodeposit", "leo_admin", "rajesh_ops", "suresh_mgr", "priya_fin"];

/* ── Generate Report Modal ── */
function GenerateReportModal({ onClose }: { onClose: () => void }) {
  const [reportName,  setReportName]  = useState("");
  const [status,      setStatus]      = useState("All");
  const [amount,      setAmount]      = useState("");
  const [reportType,  setReportType]  = useState("PayIn");
  const [user,        setUser]        = useState("");
  const [dateRange,   setDateRange]   = useState<DateRange | null>(null);

  const inputCls = "w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Report</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-5 bg-gray-50 dark:bg-gray-900">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="i.e. 2022-08 - 2022-09 Report"
              className={inputCls}
            />
            <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Optional
            </p>
          </div>

          {/* Status · Amount · Report Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
              <div className="relative">
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={selectCls}>
                  {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* User (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              User <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <select value={user} onChange={(e) => setUser(e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {USER_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <DateRangePicker value={dateRange} onChange={setDateRange} fullWidth />
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function SavedReports() {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports]     = useState<Report[]>(mockReports);

  const handleDelete = (id: string) =>
    setReports((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <IoDocumentText className="w-6 h-6" />
        <h1 className="text-xl font-bold">Reports</h1>
      </div>
      {/* Report Management card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
        {/* Sub-header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Report Management</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 ml-6">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
              <span className="text-xs text-gray-400 dark:text-gray-500">{reports.length} Report{reports.length !== 1 ? "s" : ""} available</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Generate Report
          </button>
        </div>

        {/* Report list */}
        {reports.length === 0 ? (
          <div className="px-5 py-14 text-center text-gray-400 dark:text-gray-500">
            No reports available. Generate your first report.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {reports.map((report) => (
              <li key={report.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {report.name}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeStyle[report.type]}`}>
                      {report.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {report.generatedBy}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {report.createdOn}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-red-100 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Generate Report Modal */}
      {showModal && <GenerateReportModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
