"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const successPath: Record<string, string> = {
  admin: "/",
  agent: "/agent-dashboard",
  company: "/company-dashboard",
};

export default function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    // 1. Instant check — if localStorage has the role, redirect immediately
    const cached = localStorage.getItem("auth_role");
    if (cached && successPath[cached]) {
      router.replace(successPath[cached]);
      return;
    }

    // 2. Fallback — verify session with server (handles existing logins before localStorage was added)
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; role?: string }) => {
        if (data.ok && data.role && successPath[data.role]) {
          // Sync localStorage so future checks are instant
          localStorage.setItem("auth_role", data.role);
          router.replace(successPath[data.role]);
        }
      })
      .catch(() => {/* no session — stay on signin */});
  }, [router]);

  return null;
}
