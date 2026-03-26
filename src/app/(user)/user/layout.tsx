 "use client";

import React from "react";
import { usePathname } from "next/navigation";
import UserHeader from "@/components/user/layout/UserHeader";
import UserFooter from "@/components/user/layout/UserFooter";
import CurrentOrderBanner from "@/components/user/orders/CurrentOrderBanner";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showCurrentOrder = pathname !== "/user";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserHeader />
      <main className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-6 md:px-6">
        {showCurrentOrder ? <CurrentOrderBanner /> : null}
        {children}
      </main>
      <UserFooter />
    </div>
  );
}
