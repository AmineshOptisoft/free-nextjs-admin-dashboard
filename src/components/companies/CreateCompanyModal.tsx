"use client";
import React, { useEffect, useState } from "react";
import LogoImagePicker from "./LogoImagePicker";

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateCompanyModal({ onClose, onCreated }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [activateNow, setActivateNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    brandName: "",
    commission: "",
  });

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const u = URL.createObjectURL(logoFile);
    setLogoPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [logoFile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2";

  async function handleCreate() {
    setError(null);
    if (!form.username.trim()) { setError("Company username is required."); return; }
    if (!form.password) { setError("Password is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!form.brandName.trim()) { setError("Brand name is required."); return; }
    if (!form.commission.trim()) { setError("Commission is required."); return; }
    if (!logoFile) { setError("Logo is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/company/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          brand_name: form.brandName.trim(),
          commission: form.commission.trim() || "0",
          status: activateNow ? "ACTIVE" : "PENDING",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        company?: { id: number; company_code?: string | null };
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create company.");
        return;
      }

      const newId = data.company?.id;
      if (logoFile && newId != null) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const up = await fetch(`/api/companies/${newId}/logo`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const upData = (await up.json()) as { ok?: boolean; error?: string };
        if (!up.ok || !upData.ok) {
          setError(upData.error ?? "Company created but logo upload failed.");
          onCreated?.();
          onClose();
          return;
        }
      }

      onCreated?.();
      onClose();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const pickerDisplay = logoPreview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Company Account</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-error-500 dark:text-error-400" role="alert">
              {error}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Company code is generated automatically on the server (unique).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Company username <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.username}
                onChange={set("username")}
                placeholder="Unique login username"
                className={inputCls}
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Login password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Strong password"
                  className={`${inputCls} pr-12`}
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Brand name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.brandName}
                onChange={set("brandName")}
                placeholder="Display brand name"
                className={inputCls}
                disabled={saving}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Commission (%) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.commission}
                onChange={set("commission")}
                placeholder="e.g. 0, 1.5, 2%"
                className={inputCls}
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Logo <span className="text-red-500">*</span></label>
            <LogoImagePicker
              compact
              previewSrc={pickerDisplay}
              disabled={saving}
              uploading={false}
              onFile={(f) => {
                setLogoFile(f);
              }}
            />
            {logoFile && (
              <button
                type="button"
                disabled={saving}
                onClick={() => setLogoFile(null)}
                className="mt-1 text-xs font-medium text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
              >
                Remove selected image
              </button>
            )}
            <p className="mt-1.5 text-[10px] text-gray-400">Optional — upload after account is created. No URL field.</p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 px-4 py-4 mt-1">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-0.5">Activate account immediately</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                If off, status stays pending until you activate later.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivateNow((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${activateNow ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${activateNow ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 px-7 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
