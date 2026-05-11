"use client";
import React, { useState } from "react";

/* ── Types ── */
interface VendorRow {
  id: string;
  name: string;
  security: number;
  manualPayIn: number;
  approvedPayIn: number;
  discounted: number;
  netPayIn: number;
  payout: number;
  unsettlePayout: number;
  settlement: number;
  net: number;
  prevBalance: number;
  commission: number;
  running: number;
  runningUnsettled: number;
  credit: number;
  finalBalance: number;
  remainingBalance: number;
}

/* ── Mock data ── */
const rows: VendorRow[] = [
  { id:"1",  name:"Leo SubAdmin",       security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:542,    net:0,       prevBalance:0, commission:0,    running:542,    runningUnsettled:0,    credit:0,       finalBalance:542,     remainingBalance:-542    },
  { id:"2",  name:"Chime Leo Personal", security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"3",  name:"lionel0",            security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"4",  name:"allpersonal",        security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"5",  name:"almlrest",           security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"6",  name:"Famiest",            security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"7",  name:"Famiest personal",   security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"8",  name:"Arnnold01",          security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"9",  name:"Aul,002",            security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:-348,   net:0,       prevBalance:0, commission:0,    running:-148,   runningUnsettled:-148, credit:0,       finalBalance:-1349,   remainingBalance:1349    },
  { id:"10", name:"Egg,003",            security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"11", name:"Bhrca,004",          security:200808,  manualPayIn:0,  approvedPayIn:43965, discounted:0,  netPayIn:43965,  payout:33100,   unsettlePayout:-100000, settlement:10765, net:-87736, prevBalance:0, commission:0,    running:33036,  runningUnsettled:33036,credit:400000,  finalBalance:-77772,  remainingBalance:573772  },
  { id:"12", name:"Devthe,105",         security:150000,  manualPayIn:0,  approvedPayIn:50480, discounted:0,  netPayIn:50480,  payout:11172,   unsettlePayout:0,    settlement:-872,   net:5553,    prevBalance:0, commission:0,    running:4721,   runningUnsettled:4721, credit:300000,  finalBalance:-145279, remainingBalance:445279  },
  { id:"13", name:"Mishka,108",         security:242942,  manualPayIn:0,  approvedPayIn:16818, discounted:0,  netPayIn:16818,  payout:5800,    unsettlePayout:0,    settlement:9026,   net:-28003,  prevBalance:0, commission:0,    running:10061,  runningUnsettled:10061,credit:300000,  finalBalance:-216927, remainingBalance:518627  },
  { id:"14", name:"Michelle,109",       security:226267,  manualPayIn:0,  approvedPayIn:44949, discounted:0,  netPayIn:44949,  payout:11500,   unsettlePayout:0,    settlement:-4901,  net:49479,   prevBalance:0, commission:0,    running:42548,  runningUnsettled:42548,credit:400000,  finalBalance:-182118, remainingBalance:542718  },
  { id:"15", name:"Rina,10",            security:200000,  manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:64987,   prevBalance:0, commission:0,    running:64987,  runningUnsettled:64987,credit:0,       finalBalance:-135013, remainingBalance:335013  },
  { id:"16", name:"AllPrimary personal",security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:-50807,  prevBalance:0, commission:0,    running:-50807, runningUnsettled:-50807,credit:0,      finalBalance:-50807,  remainingBalance:50807   },
  { id:"17", name:"Jatinvp,02",         security:200959,  manualPayIn:0,  approvedPayIn:14420, discounted:0,  netPayIn:14420,  payout:0,       unsettlePayout:0,    settlement:14420,  net:33108,   prevBalance:0, commission:0,    running:47509,  runningUnsettled:47509,credit:400000,  finalBalance:-103950, remainingBalance:503950  },
  { id:"18", name:"Himanshuvp,03",      security:200000,  manualPayIn:0,  approvedPayIn:15300, discounted:0,  netPayIn:15200,  payout:100000,  unsettlePayout:0,    settlement:-84800, net:85599,   prevBalance:0, commission:0,    running:759,    runningUnsettled:759,  credit:500000,  finalBalance:-199148, remainingBalance:699241  },
  { id:"19", name:"Minup,04",           security:5880,    manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:85679,   prevBalance:0, commission:0,    running:85679,  runningUnsettled:85679,credit:0,       finalBalance:73130,   remainingBalance:-73710  },
  { id:"20", name:"Sakariya,05",        security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:-4550,   prevBalance:0, commission:0,    running:-4550,  runningUnsettled:-4550,credit:0,       finalBalance:-4550,   remainingBalance:4340    },
  { id:"21", name:"Chaudhary,06",       security:220000,  manualPayIn:0,  approvedPayIn:7500,  discounted:0,  netPayIn:7500,   payout:15000,   unsettlePayout:0,    settlement:-7500,  net:12180,   prevBalance:0, commission:0,    running:10880,  runningUnsettled:10880,credit:200000,  finalBalance:-100220, remainingBalance:300220  },
  { id:"22", name:"Minup,07",           security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:0,       prevBalance:0, commission:0,    running:0,      runningUnsettled:0,    credit:0,       finalBalance:0,       remainingBalance:0       },
  { id:"23", name:"Sanjup,08",          security:153045,  manualPayIn:0,  approvedPayIn:40300, discounted:0,  netPayIn:40300,  payout:81963,   unsettlePayout:0,    settlement:-27663, net:68442,   prevBalance:0, commission:0,    running:30779,  runningUnsettled:30779,credit:400000,  finalBalance:-122099, remainingBalance:532098  },
  { id:"24", name:"Hoseem,068",         security:129000,  manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:107696,  prevBalance:0, commission:0,    running:181906, runningUnsettled:181906,credit:0,      finalBalance:6895,    remainingBalance:-6895   },
  { id:"25", name:"Rakesh,038",         security:547,     manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:74844,   prevBalance:0, commission:0,    running:74844,  runningUnsettled:74844,credit:0,       finalBalance:76297,   remainingBalance:-74297  },
  { id:"26", name:"Priyanka,008",       security:0,       manualPayIn:0,  approvedPayIn:0,     discounted:0,  netPayIn:0,      payout:0,       unsettlePayout:0,    settlement:0,      net:50187,   prevBalance:0, commission:0,    running:50187,  runningUnsettled:50187,credit:0,       finalBalance:50187,   remainingBalance:-60187  },
];

/* Totals (header data row) */
const totals: Omit<VendorRow, "id" | "name"> = {
  security:        12046777,
  manualPayIn:     0,
  approvedPayIn:   1494371,
  discounted:      0,
  netPayIn:        1485593,
  payout:          1803044,
  unsettlePayout:  -42879,
  settlement:      223946,
  net:             -3027,
  prevBalance:     0,
  commission:      316616,
  running:         21061306,
  runningUnsettled:2383706,
  credit:          16000000,
  finalBalance:    9947764,
  remainingBalance:5756887,
};

/* ── Helpers ── */
const fmt = (n: number) => {
  if (n === 0) return "0";
  const abs = Math.abs(n).toLocaleString("en-IN");
  return n < 0 ? `-${abs}` : abs;
};

const colorVal = (n: number, zeroDash = false) => {
  if (n === 0) return zeroDash ? <span className="text-gray-400">0</span> : <span>0</span>;
  return <span className={n > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{fmt(n)}</span>;
};

const badge = (n: number) => (
  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
    n > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : n < 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
  }`}>{fmt(n)}</span>
);

const colHdr = "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";
const colCell = "px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-0";

/* ── Tooltip wrapper ── */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] font-medium
                        rounded px-2 py-0.5 whitespace-nowrap shadow-lg">
          {label}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </div>
    </div>
  );
}

/* ── Component ── */
export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            {/* Pie chart icon */}
            <svg className="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2a10 10 0 1 0 10 10h-10z" />
              <path d="M13 2.05A10 10 0 0 1 21.95 11H13z" opacity="0.5" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-7">View and manage financial transactions</p>
        </div>

        {/* Right-side toolbar — borderless icon buttons */}
        <div className="flex items-center gap-0.5 flex-wrap">
          <Tip label="Copy">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            </button>
          </Tip>
          <Tip label="Security">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </button>
          </Tip>
          <Tip label="Columns">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-8 8V9m-4 6V9m8 6V9" /></svg>
            </button>
          </Tip>
          <Tip label="Download">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </Tip>
          <Tip label="Upload">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
          </Tip>
          <Tip label="Refresh">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </Tip>
          <Tip label="Archive">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </button>
          </Tip>
        </div>
      </div>

      {/* ── Financial Statistics card ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Financial Statistics</h2>
          <div className="flex items-center gap-1">
            <Tip label="Sort">
              <button className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              </button>
            </Tip>
            <Tip label="Filter">
              <button className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </button>
            </Tip>
            <Tip label="View">
              <button className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </Tip>
            <Tip label="Columns">
              <button className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 14h4a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 17v-4m6 4v-4M9 7h6" /></svg>
              </button>
            </Tip>
            <Tip label="Search">
              <button className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </Tip>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap pr-1">
              Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> results
            </span>
          </div>
        </div>

        {/* Table (horizontal scroll) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "1600px" }}>
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/[0.03] border-b border-gray-100 dark:border-gray-800">
                <th className={`${colHdr} sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 min-w-[140px]`}>Vendor</th>
                <th className={colHdr}>Security</th>
                <th className={colHdr}>
                  Manual PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>
                  Approved PayIn&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>Discounted</th>
                <th className={colHdr}>Net PayIn</th>
                <th className={colHdr}>Payout</th>
                <th className={colHdr}>Unsettle Payout</th>
                <th className={colHdr}>Settlement</th>
                <th className={colHdr}>
                  Net&nbsp;
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 text-[8px] font-bold cursor-help">i</span>
                </th>
                <th className={colHdr}>Previous Balance</th>
                <th className={colHdr}>Commission</th>
                <th className={colHdr}>Running</th>
                <th className={colHdr}>Running Unsettled</th>
                <th className={colHdr}>Credit</th>
                <th className={colHdr}>Final Balance</th>
                <th className={colHdr}>Remaining Balance</th>
                <th className={`${colHdr} text-center`}>Actions</th>
              </tr>

              {/* Totals row */}
              <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-white/[0.04]">
                <td className={`${colCell} sticky left-0 z-10 bg-gray-100 dark:bg-gray-900 font-bold text-gray-600 dark:text-gray-300`}>Vendor</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.security.toLocaleString("en-IN")}</td>
                <td className={colCell}>{totals.manualPayIn}</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.approvedPayIn.toLocaleString("en-IN")}</td>
                <td className={colCell}>{totals.discounted}</td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{totals.netPayIn.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-orange-500`}>{totals.payout.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-red-500`}>{fmt(totals.unsettlePayout)}</td>
                <td className={colCell}>{totals.settlement.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-red-500`}>{fmt(totals.net)}</td>
                <td className={colCell}>{totals.prevBalance}</td>
                <td className={`${colCell}`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-600 dark:text-green-400 font-semibold">{totals.commission.toLocaleString("en-IN")}</span>
                  </div>
                </td>
                <td className={colCell}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-600 dark:text-green-400 font-semibold">{(totals.running / 1000).toFixed(0)}K</span>
                    <span className="text-blue-500 font-semibold text-[10px]">{totals.runningUnsettled.toLocaleString("en-IN")}</span>
                  </div>
                </td>
                <td className={colCell}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-green-600 dark:text-green-400 font-semibold">{totals.runningUnsettled.toLocaleString("en-IN")}</span>
                    <span className="text-orange-500 font-semibold text-[10px]">{(totals.runningUnsettled * 0.87).toFixed(0)}</span>
                  </div>
                </td>
                <td className={`${colCell} font-bold text-blue-600 dark:text-blue-400`}>{(totals.credit / 1000000).toFixed(0)}M</td>
                <td className={`${colCell} font-bold text-green-600 dark:text-green-400`}>{totals.finalBalance.toLocaleString("en-IN")}</td>
                <td className={`${colCell} font-bold text-green-600 dark:text-green-400`}>{totals.remainingBalance.toLocaleString("en-IN")}</td>
                <td className={colCell}></td>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-blue-50/30 dark:hover:bg-white/[0.015] transition-colors">
                  {/* Vendor name — sticky */}
                  <td className={`${colCell} sticky left-0 z-10 bg-white dark:bg-gray-900 font-semibold text-gray-800 dark:text-gray-200`}>
                    {row.name}
                  </td>

                  <td className={colCell}>{row.security > 0 ? row.security.toLocaleString("en-IN") : "0"}</td>
                  <td className={colCell}>{row.manualPayIn}</td>
                  <td className={colCell}>{row.approvedPayIn > 0 ? row.approvedPayIn.toLocaleString("en-IN") : "0"}</td>
                  <td className={colCell}>{row.discounted}</td>
                  <td className={colCell}>{row.netPayIn > 0 ? row.netPayIn.toLocaleString("en-IN") : "0"}</td>
                  <td className={colCell}>{row.payout > 0 ? row.payout.toLocaleString("en-IN") : "0"}</td>
                  <td className={colCell}>{colorVal(row.unsettlePayout, true)}</td>
                  <td className={colCell}>{colorVal(row.settlement, true)}</td>
                  <td className={colCell}>{colorVal(row.net, true)}</td>
                  <td className={colCell}>{row.prevBalance}</td>
                  <td className={colCell}>{row.commission > 0 ? row.commission.toLocaleString("en-IN") : "0"}</td>

                  {/* Running — badge */}
                  <td className={colCell}>
                    {badge(row.running)}
                  </td>

                  {/* Running Unsettled — badge */}
                  <td className={colCell}>
                    {badge(row.runningUnsettled)}
                  </td>

                  <td className={colCell}>{row.credit > 0 ? row.credit.toLocaleString("en-IN") : "0"}</td>

                  {/* Final Balance */}
                  <td className={colCell}>{colorVal(row.finalBalance, true)}</td>

                  {/* Remaining Balance */}
                  <td className={colCell}>{colorVal(row.remainingBalance, true)}</td>

                  {/* Actions */}
                  <td className={`${colCell} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <button title="View" className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button title="Remove" className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-sm text-gray-400">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-300">{rows.length}</span> results
          </p>
        </div>
      </div>
    </div>
  );
}
