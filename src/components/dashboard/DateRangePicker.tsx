"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface DateRange {
  from: Date;
  to: Date;
  label?: string;
}

interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange) => void;
  fullWidth?: boolean;
}

const PANEL_WIDTH = 320;
const PANEL_MAX_HEIGHT = 420;
const GAP = 8;

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const toInputVal = (d: Date) => d.toISOString().slice(0, 10);

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
};

const today = () => startOfDay(new Date());

const buildPresets = (): { label: string; from: Date; to: Date }[] => {
  const now = today();
  const yesterday = daysAgo(1);

  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const firstOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const lastOfLastMonthCopy = new Date(now.getFullYear(), now.getMonth(), 0);

  const lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const lastYearEnd = new Date(now.getFullYear(), now.getMonth() - 1 < 0 ? 11 : now.getMonth(), 0);

  return [
    { label: "Today", from: now, to: now },
    { label: "Yesterday", from: yesterday, to: yesterday },
    { label: "Last 2 Days", from: daysAgo(1), to: now },
    { label: "Last 3 Days", from: daysAgo(2), to: now },
    { label: "Last 7 Days", from: daysAgo(6), to: now },
    { label: "Last 14 Days", from: daysAgo(13), to: now },
    { label: "Last 30 Days", from: daysAgo(29), to: now },
    { label: "Last Month", from: firstOfLastMonth, to: lastOfLastMonth },
    { label: "Last 6 Months", from: firstOf6MonthsAgo, to: lastOfLastMonthCopy },
    { label: "Last Year", from: lastYearStart, to: lastYearEnd },
  ];
};

function computePanelPosition(trigger: HTMLElement, align: "left" | "right") {
  const rect = trigger.getBoundingClientRect();
  let left =
    align === "left" ? rect.left : rect.right - PANEL_WIDTH;
  left = Math.max(GAP, Math.min(left, window.innerWidth - PANEL_WIDTH - GAP));

  const spaceBelow = window.innerHeight - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;
  let top = rect.bottom + GAP;
  if (spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow) {
    top = Math.max(GAP, rect.top - PANEL_MAX_HEIGHT - GAP);
  }

  return { top, left };
}

export default function DateRangePicker({ value, onChange, fullWidth = false }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"presets" | "range">("presets");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState(toInputVal(daysAgo(6)));
  const [rangeTo, setRangeTo] = useState(toInputVal(today()));
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const presets = buildPresets();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPanelPos(computePanelPosition(triggerRef.current, fullWidth ? "left" : "right"));
  }, [fullWidth]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleApply = () => {
    if (tab === "presets" && selectedPreset) {
      const p = presets.find((x) => x.label === selectedPreset);
      if (p) onChange({ from: p.from, to: p.to, label: p.label });
    } else if (tab === "range" && rangeFrom && rangeTo) {
      onChange({
        from: new Date(rangeFrom + "T00:00:00"),
        to: new Date(rangeTo + "T00:00:00"),
        label: `${fmtShort(new Date(rangeFrom + "T00:00:00"))} – ${fmtShort(new Date(rangeTo + "T00:00:00"))}`,
      });
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const triggerLabel = value?.label
    ? value.label
    : value
      ? `${fmtShort(value.from)} – ${fmtShort(value.to)}`
      : "Select date range";

  const panel = open ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Date range"
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        width: PANEL_WIDTH,
        zIndex: 99999,
      }}
      className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden"
    >
      <div className="grid grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("presets")}
          className={`py-3 text-sm font-semibold transition-colors ${
            tab === "presets"
              ? "bg-blue-500 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          Presets
        </button>
        <button
          type="button"
          onClick={() => setTab("range")}
          className={`py-3 text-sm font-semibold transition-colors ${
            tab === "range"
              ? "bg-blue-500 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          Range
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto px-4 py-2">
        {tab === "presets" ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {presets.map((p) => (
              <li key={p.label}>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="preset"
                      value={p.label}
                      checked={selectedPreset === p.label}
                      onChange={() => setSelectedPreset(p.label)}
                      className="h-4 w-4 cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.label}</span>
                  </div>
                  <span className="whitespace-nowrap text-sm text-gray-400">
                    {fmtShort(p.from)}–{fmtShort(p.to)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                From
              </label>
              <input
                type="date"
                value={rangeFrom}
                max={rangeTo}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                To
              </label>
              <input
                type="date"
                value={rangeTo}
                min={rangeFrom}
                onChange={(e) => setRangeTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
            {rangeFrom && rangeTo && (
              <p className="text-center text-xs text-gray-400">
                {fmtShort(new Date(rangeFrom + "T00:00:00"))} – {fmtShort(new Date(rangeTo + "T00:00:00"))}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-semibold text-blue-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={tab === "presets" ? !selectedPreset : !rangeFrom || !rangeTo}
          className="flex-1 rounded-full bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={fullWidth ? "relative w-full" : "relative inline-block"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) {
              requestAnimationFrame(() => updatePosition());
            }
            return next;
          });
        }}
        className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${
          fullWidth ? "w-full justify-between" : "shadow-sm"
        }`}
      >
        <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="max-w-[160px] truncate">{triggerLabel}</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {mounted && panel && createPortal(panel, document.body)}
    </div>
  );
}
