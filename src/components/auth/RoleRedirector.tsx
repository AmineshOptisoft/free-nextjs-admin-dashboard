"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RoleRedirector({ role }: { role: "admin" | "agent" | "company" }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;

    if (role === "admin") {
      if (
        pathname.startsWith("/agent-dashboard") ||
        pathname.startsWith("/company-dashboard") ||
        pathname.startsWith("/company-settings")
      ) {
        router.replace("/");
      }
    } else if (role === "agent") {
      const allowed = ["/agent-dashboard", "/pay-in", "/pay-out", "/my-account", "/transactions", "/dispute", "/notifications", "/ledger", "/reports", "/users"];
      if (pathname === "/" || (!allowed.some((a) => pathname.startsWith(a)))) {
        router.replace("/agent-dashboard");
      }
    } else if (role === "company") {
      const allowed = ["/company-dashboard", "/company-settings", "/pay-in", "/pay-out", "/my-account", "/transactions", "/notifications" , "/reports"];
      if (pathname === "/" || (!allowed.some((a) => pathname.startsWith(a)))) {
        router.replace("/company-dashboard");
      }
    }
  }, [role, pathname, router]);

  return null;
}
