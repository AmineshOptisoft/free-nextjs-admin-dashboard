"use client";

import React from "react";

type Props = {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear?: () => void;
  className?: string;
};

export default function DateRangeFilter({ from, to, onFromChange, onToChange, onClear, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      <div className="min-w-[130px]">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          From
        </label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
        />
      </div>
      <div className="min-w-[130px]">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          To
        </label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 dark:border-gray-800 dark:bg-white/3 dark:text-gray-200"
        />
      </div>
      {onClear && (from || to) ? (
        <button
          type="button"
          onClick={onClear}
          className="mb-0.5 h-10 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Clear dates
        </button>
      ) : null}
    </div>
  );
}
