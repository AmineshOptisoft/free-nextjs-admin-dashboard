"use client";
import React, { useEffect, useRef, useState } from "react";

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

export default function DateRangePicker({ value, onChange, fullWidth = false }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"presets" | "range">("presets");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState(toInputVal(daysAgo(6)));
  const [rangeTo, setRangeTo] = useState(toInputVal(today()));
  const ref = useRef<HTMLDivElement>(null);

  const presets = buildPresets();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  return (
    <div ref={ref} className={`relative ${fullWidth ? "w-full" : ""}`}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors ${
          fullWidth ? "w-full justify-between" : "shadow-sm"
        }`}
      >
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="max-w-[160px] truncate">{triggerLabel}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={`absolute top-[calc(100%+8px)] z-50 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden ${fullWidth ? "left-0" : "right-0"}`}>
          {/* Tabs */}
          <div className="grid grid-cols-2">
            <button
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

          {/* Body */}
          <div className="px-4 py-2 max-h-80 overflow-y-auto">
            {tab === "presets" ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {presets.map((p) => (
                  <li key={p.label}>
                    <label className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] rounded-lg px-1 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="preset"
                          value={p.label}
                          checked={selectedPreset === p.label}
                          onChange={() => setSelectedPreset(p.label)}
                          className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.label}</span>
                      </div>
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {fmtShort(p.from)}–{fmtShort(p.to)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-3 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">From</label>
                  <input
                    type="date"
                    value={rangeFrom}
                    max={rangeTo}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">To</label>
                  <input
                    type="date"
                    value={rangeTo}
                    min={rangeFrom}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                {rangeFrom && rangeTo && (
                  <p className="text-xs text-gray-400 text-center">
                    {fmtShort(new Date(rangeFrom + "T00:00:00"))} – {fmtShort(new Date(rangeTo + "T00:00:00"))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-semibold text-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={tab === "presets" ? !selectedPreset : !rangeFrom || !rangeTo}
              className="flex-1 rounded-full bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
