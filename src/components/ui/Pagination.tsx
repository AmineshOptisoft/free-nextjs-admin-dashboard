"use client";
import React from "react";

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total <= pageSize) return null;

  const start = Math.min((page - 1) * pageSize + 1, total);
  const end   = Math.min(page * pageSize, total);

  /* Build visible page numbers with ellipsis */
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const btnBase =
    "inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors select-none";
  const btnActive =
    "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm";
  const btnInactive =
    "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700";
  const btnDisabled =
    "border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
      <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
        Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{start}–{end}</span> of{" "}
        <span className="font-semibold text-gray-600 dark:text-gray-300">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${btnBase} px-2.5 gap-1 ${page === 1 ? btnDisabled : btnInactive}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400 dark:text-gray-500 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} px-3 ${page === p ? btnActive : btnInactive}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${btnBase} px-2.5 gap-1 ${page === totalPages ? btnDisabled : btnInactive}`}
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
