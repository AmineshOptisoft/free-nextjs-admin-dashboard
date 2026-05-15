"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PERIODS = ["7 Days", "30 Days", "3 Months"] as const;
type Period = (typeof PERIODS)[number];

const generateDates = (days: number) => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }));
  }
  return dates;
};

export default function TransactionVolumeChart() {
  const [period, setPeriod] = useState<Period>("30 Days");
  const [payins, setPayins] = useState<Array<{ status: string; createdAtIso?: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/agent/transactions?type=PAYIN&limit=10", { credentials: "include" });
        const data = (await res.json()) as { ok?: boolean; items?: Array<{ status: string; createdAtIso?: string }> };
        if (!mounted || !res.ok || !data.ok || !data.items) return;
        setPayins(data.items);
      } catch {
        // keep empty
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const d = useMemo(() => {
    const days = period === "7 Days" ? 7 : period === "30 Days" ? 30 : 90;
    const categories = generateDates(days);
    const success = Array(days).fill(0) as number[];
    const failed = Array(days).fill(0) as number[];

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    const dayMs = 24 * 60 * 60 * 1000;

    for (const t of payins) {
      if (!t.createdAtIso) continue;
      const ms = new Date(t.createdAtIso).getTime();
      if (!Number.isFinite(ms)) continue;
      const idx = Math.floor((ms - start.getTime()) / dayMs);
      if (idx < 0 || idx >= days) continue;
      if (t.status === "APPROVED") success[idx] += 1;
      else if (t.status === "EXPIRED") failed[idx] += 1;
    }

    return { categories, success, failed };
  }, [period, payins]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#22c55e", "#ef4444"],
    stroke: { curve: "smooth", width: [2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.02 },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f0f0f0",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: { size: 0, hover: { size: 5 } },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#6b7280" },
    },
    xaxis: {
      categories: d.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        rotate: -30,
        hideOverlappingLabels: true,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        formatter: (v) => String(Math.round(v)),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v) => `${v} txns` },
    },
  };

  const series = [
    { name: "Success", data: d.success },
    { name: "Failed", data: d.failed },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Transaction Volume
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">Success vs Failed transactions over time</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === p
                  ? "bg-white shadow text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <Chart options={options} series={series} type="area" height={280} />
        </div>
      </div>
    </div>
  );
}
