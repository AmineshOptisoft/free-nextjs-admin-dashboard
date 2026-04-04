"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import UserHeader from "@/components/user/layout/UserHeader";
import CurrentOrderBanner from "@/components/user/orders/CurrentOrderBanner";
import { UserContext } from "@/context/UserContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showCurrentOrder = pathname !== "/user";
  const { user, customers, handleSelect } = useContext(UserContext);

  const simulateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelect(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <UserHeader />

      {/* Persistence / Simulation Selector (Only in Dev or specifically for this project) */}
      {/* <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 p-2 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Simulate:</span>
        <select
          value={user?.id || ""}
          onChange={simulateSelect}
          className="rounded border-none bg-transparent text-xs font-medium text-brand-600 focus:ring-0"
        >
          <option value="">Guest</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.firstName}
            </option>
          ))}
        </select>
      </div> */}

      <main className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-6 md:px-6">
        {showCurrentOrder ? <CurrentOrderBanner /> : null}
        {children}
      </main>
    </div>
  );
}
