"use client";

import React from "react";

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="min-w-[170px] flex-1">
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="relative">
        <select className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function TransactionReportFilters() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-end gap-3">
        <SelectField label="Date Range" options={["All Time", "Today", "Last 7 Days", "Last 30 Days"]} />
        <SelectField label="Vendor" options={["All Vendors", "Bablu0012", "sachin80"]} />
        <SelectField label="Transaction Type" options={["All Types", "Pay In", "Pay Out"]} />
        <SelectField label="Status" options={["All Statuses", "Approved", "Expired", "Reassigned"]} />
        <button className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-xs font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  );
}
