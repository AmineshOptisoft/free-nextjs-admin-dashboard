"use client";

import React from "react";
import Link from "next/link";
import { NotificationsIcon } from "@/icons/nav-icons";
import { useNotifications, type NotificationKind } from "@/context/NotificationContext";

function kindIcon(kind: NotificationKind) {
  if (kind === "payin") return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
      </svg>
    </div>
  );
  if (kind === "payout") return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );
  if (kind === "dispute") return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

export default function CompanyNotifications() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white justify-between">
        <div className="flex items-center gap-2">
          <NotificationsIcon />
          <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            View all your recent real-time alerts
          </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 xl:col-span-2 overflow-hidden flex flex-col min-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <NotificationsIcon />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">No recent notifications</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">You&apos;re all caught up!</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => (
                <li key={notif.id}>
                  <Link
                    href={notif.href}
                    onClick={() => markRead(notif.id)}
                    className={`flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notif.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                  >
                    {kindIcon(notif.kind)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${!notif.read ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notif.body}</p>
                    </div>
                    {!notif.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white h-fit dark:border-gray-800 dark:bg-white/3">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Notification Status</h3>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Local Queue</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{notifications.length} / 50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Unread Alerts</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">{unreadCount}</span>
            </div>
            <p className="border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
              Alerts disappear here after your latest active session and handle live data gracefully. Unread alerts sync automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
