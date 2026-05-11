"use client";
import React, { useState } from "react";
import Link from "next/link";
import CreateCompanyModal from "./CreateCompanyModal";
import Pagination from "../ui/Pagination";
import { GoOrganization } from "react-icons/go";


/* ── Inline edit modal ── */
interface EditModalProps { company: Company; onClose: () => void; }
function EditModal({ company, onClose }: EditModalProps) {
  const [form, setForm] = useState({
    name: company.name, email: company.email,
    commission: company.commission, brandName: company.brandName,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Company — {company.name}</h2>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-4.5 h-4.5" style={{width:"18px",height:"18px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Name</label><input value={form.name} onChange={set("name")} className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input value={form.email} onChange={set("email")} className={inputCls} /></div>
          <div><label className={labelCls}>Commission (%)</label><input value={form.commission} onChange={set("commission")} className={inputCls} /></div>
          <div><label className={labelCls}>Brand Name</label><input value={form.brandName} onChange={set("brandName")} className={inputCls} /></div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-blue-500 hover:bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

interface Company {
  id: string;
  name: string;
  email: string;
  todayIn: number;
  todayOut: number;
  totalPayIn: number;
  totalPayOut: number;
  status: "Active" | "Inactive";
  commission: string;
  brandName: string;
  logo?: string;
}

const mockCompanies: Company[] = [
  { id: "1", name: "Rajputana",  email: "Rajputana777@gmail.com", todayIn: 0,     todayOut: 0, totalPayIn: 0,     totalPayOut: 0, status: "Active", commission: "3%",   brandName: "Rajputana" },
  { id: "2", name: "Dafaxbets",  email: "dfx80@gmail.com",        todayIn: 0,     todayOut: 0, totalPayIn: 4800,  totalPayOut: 0, status: "Active", commission: "3%",   brandName: "Dafaxbets.com" },
  { id: "3", name: "win777",     email: "win777@win777.com",       todayIn: 0,     todayOut: 0, totalPayIn: 0,     totalPayOut: 0, status: "Active", commission: "3.6%", brandName: "WIN777", logo: "🎰" },
  { id: "4", name: "BetKings",   email: "admin@betkings.io",       todayIn: 12000, todayOut: 8000, totalPayIn: 98000, totalPayOut: 54000, status: "Active",   commission: "2.5%", brandName: "BetKings" },
  { id: "5", name: "SpinZone",   email: "ops@spinzone.com",        todayIn: 0,     todayOut: 0, totalPayIn: 21000, totalPayOut: 9000,  status: "Inactive", commission: "4%",   brandName: "SpinZone" },
];

const PAGE_SIZE = 10;

const fmt = (n: number) => "₹\u00A0" + n.toLocaleString("en-IN");

function InfoTip({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-bold cursor-help ml-1">i</span>
  );
}

export default function CompaniesList() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Company["status"]>>(
    Object.fromEntries(mockCompanies.map((c) => [c.id, c.status]))
  );

  const toggleStatus = (id: string) =>
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === "Active" ? "Inactive" : "Active" }));

  const filtered = mockCompanies.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.brandName.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <GoOrganization className="w-6 h-6" />
        <h1 className="text-xl font-bold">Companies Management</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add New Company
        </button>
      </div>

      {/* ── Main card ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search companies..."
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-12">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Company Info <InfoTip text="Company name and contact email" />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Today (In/Out) <InfoTip text="Today's pay-in and pay-out totals" />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Total Volume (In/Out) <InfoTip text="All-time pay-in and pay-out volume" />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Status <InfoTip text="Current account status" />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Commission (%)</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Brand Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Logo</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-gray-400 dark:text-gray-500">
                    No companies found.
                  </td>
                </tr>
              ) : (
                paginated.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* # */}
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    {/* Company Info */}
                    <td className="px-5 py-4">
                      <a href="#" className="text-sm font-semibold text-blue-500 hover:underline block leading-tight">
                        {c.name}
                      </a>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{c.email}</span>
                    </td>

                    {/* Today In/Out */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">In:</span>
                          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${c.todayIn > 0 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {fmt(c.todayIn)}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Out:</span>
                          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${c.todayOut > 0 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {fmt(c.todayOut)}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Total Volume */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <span><span className="text-gray-400">PayIn:</span> {fmt(c.totalPayIn)}</span>
                        <span><span className="text-gray-400">PayOut:</span> {fmt(c.totalPayOut)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${
                        statuses[c.id] === "Active"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {statuses[c.id]}
                      </span>
                    </td>

                    {/* Commission */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {c.commission}
                    </td>

                    {/* Brand Name */}
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {c.brandName}
                    </td>

                    {/* Logo */}
                    <td className="px-5 py-4">
                      {c.logo ? (
                        <span className="text-2xl leading-none">{c.logo}</span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">No logo</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View */}
                        <Link
                          href={`/companies/${c.id}`}
                          title="View details"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        {/* Edit */}
                        <button
                          title="Edit company"
                          onClick={() => setEditCompany(c)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Toggle Active / Inactive */}
                        <button
                          title={statuses[c.id] === "Active" ? "Deactivate" : "Activate"}
                          onClick={() => toggleStatus(c.id)}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                            statuses[c.id] === "Active"
                              ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                              : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete company"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Footer: entries info + pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
            {filtered.length === 0
              ? "No entries"
              : `Showing ${start} to ${end} of ${filtered.length} entries`}
          </p>
          <Pagination
            total={filtered.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate  && <CreateCompanyModal onClose={() => setShowCreate(false)} />}
      {editCompany && <EditModal company={editCompany} onClose={() => setEditCompany(null)} />}
    </div>
  );
}
