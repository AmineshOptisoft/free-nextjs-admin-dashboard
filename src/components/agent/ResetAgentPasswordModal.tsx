"use client";

import React, { useCallback, useEffect, useState } from "react";

type Props = {
  agentId: string;
  username: string;
  onClose: () => void;
  onSaved: () => void;
};

function shuffleString(s: string): string {
  const arr = s.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (crypto.getRandomValues(new Uint8Array(1))[0] ?? 0) % (i + 1);
    const t = arr[i];
    arr[i] = arr[j]!;
    arr[j] = t!;
  }
  return arr.join("");
}

/** Cryptographically random password with upper, lower, digit, and symbol. */
function generateStrongPassword(length = 14): string {
  const minLen = Math.max(12, length);
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "_*@#$%&!-+";
  const all = upper + lower + digits + special;
  const pick = (set: string) => set[(crypto.getRandomValues(new Uint8Array(1))[0] ?? 0) % set.length];

  let core =
    pick(upper) + pick(lower) + pick(digits) + pick(special);
  const rest = new Uint8Array(minLen - core.length);
  crypto.getRandomValues(rest);
  for (let i = 0; i < rest.length; i++) {
    core += all[rest[i]! % all.length];
  }
  return shuffleString(core);
}

const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5";
const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500";

export default function ResetAgentPasswordModal({ agentId, username, onClose, onSaved }: Props) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPassword(generateStrongPassword());
  }, []);

  const regenerate = useCallback(() => {
    setPassword(generateStrongPassword());
    setCopied(false);
    setError(null);
  }, []);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [password]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    const pwd = password.trim();
    if (pwd.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pwd }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save password.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Generate new password</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Agent: {username}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div>
            <label className={labelCls}>Username</label>
            <input readOnly value={username} className={inputCls} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className={labelCls}>Temporary password</label>
              <div className="flex gap-2">
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className={`${inputCls} flex-1 min-w-0 font-mono text-xs sm:text-sm`}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => void copyPassword()}
                  disabled={!password || saving}
                  title="Copy to clipboard"
                  className="flex h-[42px] w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <span className="text-[10px] font-semibold text-green-600">OK</span>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={regenerate}
              disabled={saving}
              className="shrink-0 rounded-xl border-2 border-violet-500 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:border-violet-400 dark:text-violet-300 dark:hover:bg-violet-950/40"
            >
              Generate Strong Password
            </button>
          </div>

          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Please share these credentials securely with the agent. The password should be changed upon first login.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !password.trim()}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            {saving ? "Saving…" : "Save Password"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
