"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications, type AppNotification, type NotificationKind } from "@/context/NotificationContext";
import { Dropdown } from "../ui/dropdown/Dropdown";

/* ── Icons ────────────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
        fill="currentColor"
      />
    </svg>
  );
}

function kindIcon(kind: NotificationKind) {
  if (kind === "payin") return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
      </svg>
    </div>
  );
  if (kind === "payout") return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );
  if (kind === "dispute") return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
  // user
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Notification Item ─────────────────────────────────────────── */
function NotifItem({ notif, onClose, onMarkRead }: { notif: AppNotification; onClose: () => void; onMarkRead: (id: string) => void }) {
  return (
    <li>
      <Link
        href={notif.href}
        onClick={() => { onMarkRead(notif.id); onClose(); }}
        className={`flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5 transition-colors ${!notif.read ? "bg-blue-50/60 dark:bg-blue-900/10" : ""}`}
      >
        {kindIcon(notif.kind)}
        <span className="block min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold text-gray-800 dark:text-white truncate ${!notif.read ? "text-blue-700 dark:text-blue-300" : ""}`}>
              {notif.title}
            </span>
            {!notif.read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{notif.body}</span>
          <span className="mt-1 block text-[10px] text-gray-400 dark:text-gray-500">{timeAgo(notif.createdAt)}</span>
        </span>
      </Link>
    </li>
  );
}

/* ── Main Dropdown ─────────────────────────────────────────────── */
export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const prevCountRef = useRef(unreadCount);

  // Animate pulse only when new unread arrives
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 3000);
      prevCountRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const close = () => setIsOpen(false);

  const handleOpen = () => {
    setIsOpen((v) => !v);
  };

  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        {/* Unread dot / count badge */}
        {unreadCount > 0 && (
          <span className={`absolute -right-0.5 -top-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ${pulse ? "animate-bounce" : ""}`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <BellIcon />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={close}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-800 dark:text-gray-200">Notifications</h5>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="rounded px-2 py-0.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => { clearAll(); }}
                className="rounded px-2 py-0.5 text-[11px] font-semibold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={close}
              className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <ul className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Real-time alerts will appear here</p>
            </li>
          ) : (
            notifications.map((n) => (
              <NotifItem key={n.id} notif={n} onClose={close} onMarkRead={markRead} />
            ))
          )}
        </ul>

        {/* Footer */}
        <Link
          href="/notifications"
          onClick={close}
          className="mt-3 block rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
