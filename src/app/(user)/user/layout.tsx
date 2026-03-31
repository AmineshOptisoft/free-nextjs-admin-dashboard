"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import UserHeader from "@/components/user/layout/UserHeader";
import UserFooter from "@/components/user/layout/UserFooter";
import CurrentOrderBanner from "@/components/user/orders/CurrentOrderBanner";

// Context to share active customer data
export const UserContext = createContext<{
  user: any | null;
  refreshUser: () => void;
}>({ user: null, refreshUser: () => { } });

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showCurrentOrder = pathname !== "/user";

  const [customers, setCustomers] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) setActiveUser(await res.json());
    } catch (e) { console.error(e); }
  };

  const refreshUser = () => {
    const id = localStorage.getItem("sim_customer_id");
    if (id) fetchUser(id); else setActiveUser(null);
  };

  useEffect(() => {
    // 1. Fetch customers for selector
    fetch("/api/customers").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setCustomers(data);
    });
    // 2. Load active user from storage
    refreshUser();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      localStorage.setItem("sim_customer_id", id);
      fetchUser(id);
    } else {
      localStorage.removeItem("sim_customer_id");
      setActiveUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user: activeUser, refreshUser }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <UserHeader />


        <main className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-6 md:px-6">
          {showCurrentOrder ? <CurrentOrderBanner /> : null}
          {children}
        </main>
        {/* <UserFooter /> */}
      </div>
    </UserContext.Provider >
  );
}
