"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, UserCircleIcon, ChevronDownIcon, ShootingStarIcon, ListIcon, PaperPlaneIcon, GridIcon } from "@/icons";
import UserAuthModal from "./UserAuthModal";
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";

export default function UserHeader() {
  const pathname = usePathname();
  const { user: activeUser, logout } = useContext(UserContext) as any;
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [open, setOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const showAuthButtons = !activeUser && (pathname === "/" || pathname.startsWith("/user"));
  const showUserIcon = !!activeUser;

  const openModal = (mode: "login" | "signup", path?: string) => {
    setAuthMode(mode);
    setPendingPath(path || "");
    setOpen(true);
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!activeUser) {
      e.preventDefault();
      openModal("login", path);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  const initials = activeUser 
    ? `${activeUser.firstName?.[0] || ""}${activeUser.lastName?.[0] || ""}`.toUpperCase() 
    : "U";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) items-center justify-between px-4 py-3 md:px-6">
          <Link href="/user" className="text-2xl font-bold text-brand-600">
            Kadi
          </Link>

          {/* Main nav removed as per request to move items to dropdown */}
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {!activeUser ? (
              <>
                <button
                  onClick={() => openModal("login")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal("signup")}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <Link
                href="/user/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
              >
                <GridIcon className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800">
              <Link
                href="/user/notifications"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                title="Notifications"
              >
                <BellIcon />
              </Link>

              {activeUser && (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors dropdown-toggle"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xs shadow-sm">
                      {initials}
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <Dropdown
                    isOpen={isDropdownOpen}
                    onClose={closeDropdown}
                    className="absolute right-0 mt-2 w-[220px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-2"
                  >
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                          {activeUser.firstName} {activeUser.lastName}
                        </p>
                        <p className="text-[10px] text-brand-600 font-medium uppercase tracking-wider">
                          Customer
                        </p>
                      </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                      <Link
                        href="/user/dashboard"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                      >
                        <GridIcon className="w-4 h-4 text-gray-400" />
                        Dashboard
                      </Link>

                      <Link
                        href="/user/book-ride"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-lg transition-colors"
                      >
                        <ShootingStarIcon className="w-4 h-4 text-brand-500" />
                        Book a Ride
                      </Link>

                      <Link
                        href="/user/orders"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                      >
                        <ListIcon className="w-4 h-4 text-gray-400" />
                        My Orders
                      </Link>

                      <Link
                        href="/user/track"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                      >
                        <PaperPlaneIcon className="w-4 h-4 text-gray-400" />
                        Track
                      </Link>

                      <Link
                        href="/user/profile"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                      >
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        Profile Settings
                      </Link>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          closeDropdown();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-500">
                          <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Logout
                      </button>
                    </nav>
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <UserAuthModal mode={authMode} open={open} onClose={() => setOpen(false)} pendingPath={pendingPath} />
    </>
  );
}
