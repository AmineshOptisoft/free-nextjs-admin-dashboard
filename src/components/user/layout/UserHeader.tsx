"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, UserCircleIcon } from "@/icons";
import UserAuthModal from "./UserAuthModal";

export default function UserHeader() {
  const pathname = usePathname();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [open, setOpen] = useState(false);
  const showAuthButtons = pathname === "/" || pathname === "/user";
  const showUserIcon = pathname !== "/user";

  const openModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) items-center justify-between px-4 py-3 md:px-6">
          <Link href="/user" className="text-2xl font-bold text-brand-600">
            Kandi
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <Link
              href="/user/orders"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300"
            >
              My Orders
            </Link>
            <Link
              href="/user/track"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300"
            >
              Track
            </Link>
            <Link
              href="/user/profile"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {showAuthButtons ? (
              <>
                <button
                  onClick={() => openModal("login")}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal("signup")}
                  className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Sign Up
                </button>
              </>
            ) : null}
            <Link
              href="/user/notifications"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              title="Notifications"
            >
              <BellIcon />
            </Link>
            {showUserIcon ? (
              <Link
                href="/user/profile"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                title="Profile"
              >
                <UserCircleIcon />
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <UserAuthModal mode={authMode} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
