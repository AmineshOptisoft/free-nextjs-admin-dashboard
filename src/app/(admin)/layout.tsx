"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content offset based on sidebar state.
  // Use padding-left (not margin-left) to avoid page-level horizontal overflow
  // while sidebar is fixed-positioned.
  const mainContentOffset = isMobileOpen
    ? "pl-0"
    : isExpanded || isHovered
    ? "lg:pl-[290px]"
    : "lg:pl-[90px]";

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`min-w-0 w-full transition-all duration-300 ease-in-out ${mainContentOffset}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-3 w-full">{children}</div>
      </div>
    </div>
  );
}
