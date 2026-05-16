"use client";

import { useSidebar } from "@/context/SidebarContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import RealtimeNotifications from "@/components/realtime/RealtimeNotifications";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentOffset = isMobileOpen
    ? "pl-0"
    : isExpanded || isHovered
      ? "lg:pl-[290px]"
      : "lg:pl-[90px]";

  return (
    <RealtimeProvider>
      <RealtimeNotifications />
      <div className="min-h-screen overflow-x-hidden">
        <AppSidebar />
        <Backdrop />
        <div className={`min-w-0 w-full transition-all duration-300 ease-in-out ${mainContentOffset}`}>
          <AppHeader />
          <div className="p-3 w-full">{children}</div>
        </div>
      </div>
    </RealtimeProvider>
  );
}
