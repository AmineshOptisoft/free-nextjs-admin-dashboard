"use client";

import React from "react";

export default function CompanyNotifications() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          View all your recent real-time alerts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/3 xl:col-span-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2.03 2.03 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">No recent notifications</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">You&apos;re all caught up!</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Notification Status</h3>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Active Session Queue</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">0 / 50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Unread Alerts</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">0</span>
            </div>
            <p className="border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
              Alerts disappear here after your latest active session and handle live data gracefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
