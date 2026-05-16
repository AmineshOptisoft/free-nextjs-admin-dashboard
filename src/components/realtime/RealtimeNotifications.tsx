"use client";
import React, { useEffect, useState } from "react";
import { useRealtime } from "@/context/RealtimeContext";
import { TransactionRealtimePayload, UserRealtimePayload } from "@/lib/realtime/types";

type NotificationData = 
  | { type: "transaction"; data: TransactionRealtimePayload }
  | { type: "user"; data: UserRealtimePayload };

export default function RealtimeNotifications() {
  const { subscribe } = useRealtime();
  const [active, setActive] = useState<NotificationData | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const unsubscribe = subscribe((payload) => {
      setActive(payload);
      
      const timer = setTimeout(() => {
        setActive((prev) => {
          if (!prev) return null;
          if (prev.type === "transaction" && payload.type === "transaction") {
            return prev.data.id === payload.data.id && prev.data.updatedAt === payload.data.updatedAt ? null : prev;
          }
          if (prev.type === "user" && payload.type === "user") {
            return prev.data.userId === payload.data.userId && prev.data.updatedAt === payload.data.updatedAt ? null : prev;
          }
          return prev;
        });
      }, 5000);

      if ("Notification" in window && Notification.permission === "granted") {
        if (payload.type === "transaction") {
          const p = payload.data;
          new Notification(`${p.type} ${p.action.toUpperCase()}`, {
            body: `Order ID: ${p.id}\nStatus: ${p.status}`,
          });
        } else {
          const p = payload.data;
          new Notification(`${p.role.toUpperCase()} UPDATED`, {
            body: `User ID: ${p.userId}\nNew Status: ${p.status}`,
          });
        }
      }

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, [subscribe]);

  if (!active) return null;

  const isTx = active.type === "transaction";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-right-10 duration-300">
      <div className="flex w-80 items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isTx 
            ? (active.data.type === "PAYIN" ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30")
            : "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
        }`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {isTx 
                ? `${active.data.type} ${active.data.action.charAt(0).toUpperCase() + active.data.action.slice(1)}`
                : `${active.data.role.toUpperCase()} Status Updated`
              }
            </p>
            <button 
              onClick={() => setActive(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isTx ? `ID: ${active.data.id}` : `User ID: ${active.data.userId}`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              active.data.status.includes("APPROVED") || active.data.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              active.data.status.includes("REJECT") || active.data.status.includes("EXPIRE") || active.data.status === "BLOCKED" || active.data.status === "DEACTIVATED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}>
              {active.data.status.replace(/_/g, " ")}
            </span>
            {isTx && active.data.disputeRaised && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Dispute
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
