"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CreateAgentModal from "./CreateAgentModal";
import Pagination from "../ui/Pagination";

type AgentStatus = "online" | "offline";

interface Agent {
  id: string;
  username: string;
  status: AgentStatus;
  role: string;
  parent: string;
  lastSeen: string;
  country: string;
  city: string;
  ip: string;
}

const mockAgents: Agent[] = [
  { id:"1",  username:"Mafiya0808",  status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"52 minutes ago",  country:"IN", city:"Lucknow",   ip:"47.9.65.142" },
  { id:"2",  username:"Ajmonu8989",  status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"1 day ago",       country:"IN", city:"",          ip:"106.205.156.252" },
  { id:"3",  username:"Salasar007",  status:"offline", role:"subadmin", parent:"daniyalleo", lastSeen:"Never logged in", country:"",   city:"",          ip:"" },
  { id:"4",  username:"Anjani2424",  status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"49 minutes ago",  country:"IN", city:"Mumbai",    ip:"223.184.246.92" },
  { id:"5",  username:"Chirag3232",  status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"49 minutes ago",  country:"IN", city:"Delhi",     ip:"49.32.156.80" },
  { id:"6",  username:"Prince334",   status:"offline", role:"subadmin", parent:"daniyalleo", lastSeen:"3 days ago",      country:"IN", city:"Jaipur",    ip:"117.55.241.18" },
  { id:"7",  username:"Ravi_Ops99",  status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"12 minutes ago",  country:"IN", city:"Hyderabad", ip:"203.145.22.71" },
  { id:"8",  username:"Tanya_Pay",   status:"offline", role:"subadmin", parent:"daniyalleo", lastSeen:"5 hours ago",     country:"IN", city:"Pune",      ip:"152.58.107.44" },
  { id:"9",  username:"Ankit_V21",   status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"30 minutes ago",  country:"IN", city:"Kolkata",   ip:"59.91.160.33" },
  { id:"10", username:"Sunita_FP",   status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"Just now",        country:"IN", city:"Chennai",   ip:"122.164.55.89" },
  { id:"11", username:"Deepak_VIP",  status:"offline", role:"subadmin", parent:"daniyalleo", lastSeen:"1 week ago",      country:"IN", city:"Surat",     ip:"117.197.4.203" },
  { id:"12", username:"Meena_UPI",   status:"online",  role:"subadmin", parent:"daniyalleo", lastSeen:"2 hours ago",     country:"IN", city:"Nagpur",    ip:"49.248.175.66" },
];

const PAGE_SIZE = 6;

/* ── Agent Card (Grid View) ── */
function AgentCard({ agent, onDeleteClick }: { agent: Agent; onDeleteClick: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4 flex flex-col gap-3">
      {/* Top row: avatar + name + status + role + delete */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/agent/${agent.id}`} className="text-sm font-bold text-blue-500 hover:underline truncate">
                {agent.username}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                agent.status === "online"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {agent.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Parent: {agent.parent}</p>
          </div>
        {/* Role badge + delete */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {agent.role}
          </span>
          <button
            type="button"
            aria-label="Delete agent"
            onClick={(e) => {
              e.preventDefault();
              onDeleteClick();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Last seen */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{agent.lastSeen}</span>
      </div>

      {/* Location + IP */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            <span className="text-gray-400">country:</span> {agent.country}&nbsp;&nbsp;
            <span className="text-gray-400">city:</span> {agent.city}
          </span>
        </div>
        {agent.ip && (
          <p className="text-xs text-gray-400 dark:text-gray-500 pl-5">ip: {agent.ip}</p>
        )}
      </div>

      {/* Enforce 2FA */}
      <button className="inline-flex items-center gap-1.5 self-start rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Enforce 2FA
      </button>
    </div>
  );
}

/* ── Agent Row (List View) ── */
function AgentRow({ agent, onDeleteClick }: { agent: Agent; onDeleteClick: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/agent/${agent.id}`} className="text-sm font-semibold text-blue-500 hover:underline">
            {agent.username}
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            agent.status === "online"
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
          }`}>{agent.status}</span>
          <span className="rounded border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{agent.role}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Parent: {agent.parent} · {agent.lastSeen}
          {agent.ip && <> · ip: {agent.ip}</>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          2FA
        </button>
        <button
          type="button"
          aria-label="Delete agent"
          onClick={(e) => {
            e.preventDefault();
            onDeleteClick();
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AgentList() {
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<Agent[]>(() => mockAgents.map((a) => ({ ...a })));
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!removeConfirmId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRemoveConfirmId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [removeConfirmId]);

  const confirmRemoveAgent = () => {
    if (!removeConfirmId) return;
    setAgents((prev) => prev.filter((a) => a.id !== removeConfirmId));
    setRemoveConfirmId(null);
  };

  const filtered = agents.filter((a) =>
    !search ||
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.parent.toLowerCase().includes(search.toLowerCase()) ||
    a.ip.includes(search) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendors</h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
        {/* Left: All Agents + count */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">All Vendors</span>
          <span className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-600 dark:text-gray-300">
            {filtered.length}
          </span>
        </div>

        {/* Right: + button, search, view toggles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Add agent */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Search toggle / input */}
          {searchOpen ? (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                placeholder="Search Vendors..."
                className="w-44 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Search Vendors...</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Agents List section ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Section heading */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Vendors List</h2>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">No vendors found.</div>
        ) : viewMode === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paginated.map((a) => (
              <AgentCard key={a.id} agent={a} onDeleteClick={() => setRemoveConfirmId(a.id)} />
            ))}
          </div>
        ) : (
          <div>
            {paginated.map((a) => (
              <AgentRow key={a.id} agent={a} onDeleteClick={() => setRemoveConfirmId(a.id)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      <Pagination
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* ── Create Agent Modal ── */}
      {showCreate && <CreateAgentModal onClose={() => setShowCreate(false)} />}

      {removeConfirmId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-agent-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
            aria-label="Dismiss"
            onClick={() => setRemoveConfirmId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 id="remove-agent-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Remove vendor?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This will remove{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {agents.find((a) => a.id === removeConfirmId)?.username ?? "this agent"}
              </span>{" "}
              from the list. Refresh the page to restore mock data.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveConfirmId(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveAgent}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
