"use client";

import React, { useState, useEffect, createContext } from "react";

// Context to share active customer data across the whole application
export const UserContext = createContext<{
  user: any | null;
  refreshUser: () => void;
  logout: () => void;
  customers: any[];
  handleSelect: (id: string) => void;
}>({ 
  user: null, 
  refreshUser: () => {}, 
  logout: () => {},
  customers: [],
  handleSelect: () => {}
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveUser(data);
      }
    } catch (e) {
      console.error("Failed to fetch user:", e);
    }
  };

  const refreshUser = () => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("sim_customer_id");
      if (id) {
        fetchUser(id);
      } else {
        setActiveUser(null);
      }
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sim_customer_id");
      localStorage.removeItem("sim_customer_token");
      setActiveUser(null);
    }
  };

  const handleSelect = (id: string) => {
    if (id) {
      localStorage.setItem("sim_customer_id", id);
      fetchUser(id);
    } else {
      localStorage.removeItem("sim_customer_id");
      setActiveUser(null);
    }
  };

  useEffect(() => {
    // 1. Fetch customers for simulation selector
    fetch("/api/customers").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setCustomers(data);
    });

    // 2. Load active user
    refreshUser();
    
    // Add a simple listener for storage changes between tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sim_customer_id") {
        refreshUser();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ user: activeUser, refreshUser, logout, customers, handleSelect }}>
      {children}
    </UserContext.Provider>
  );
}
