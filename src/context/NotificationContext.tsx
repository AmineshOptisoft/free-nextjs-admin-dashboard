"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRealtime } from "./RealtimeContext";
import { useAuth } from "./AuthContext";
import type { TransactionRealtimePayload, UserRealtimePayload } from "@/lib/realtime/types";

/* ── Types ──────────────────────────────────────────────────── */
export type NotificationKind = "payin" | "payout" | "user" | "dispute";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string; // ISO
  read: boolean;
  txId?: string;
  status?: string;
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

/* ── Helpers ──────────────────────────────────────────────────── */
const MAX_NOTIFICATIONS = 50;

function storageKey(userId: string | null | undefined): string {
  return `tepay_notifications_${userId ?? "anon"}`;
}

function loadFromStorage(key: string): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AppNotification[];
  } catch {
    return [];
  }
}

function saveToStorage(key: string, items: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    // storage quota exceeded — ignore
  }
}

function buildFromTx(payload: TransactionRealtimePayload, role: string): AppNotification | null {
  const { id, type, status, action, updatedAt, disputeRaised } = payload;
  const isTxAdmin = role === "admin";
  const href = isTxAdmin ? `/pay-${type === "PAYIN" ? "in" : "out"}` : type === "PAYIN" ? "/pay-in" : "/pay-out";

  let title = "";
  let body = "";
  const kind: NotificationKind = disputeRaised ? "dispute" : type === "PAYIN" ? "payin" : "payout";

  if (disputeRaised && action === "dispute") {
    title = `Dispute raised on ${type === "PAYIN" ? "Pay In" : "Pay Out"}`;
    body = `Transaction #${id} has an open dispute. Click to review.`;
  } else if (action === "create") {
    title = `New ${type === "PAYIN" ? "Pay In" : "Pay Out"} request`;
    body = `Transaction #${id} created${status ? ` — ${status.replace(/_/g, " ")}` : ""}.`;
  } else if (action === "assign") {
    title = `${type === "PAYIN" ? "Pay In" : "Pay Out"} assigned`;
    body = `Transaction #${id} assigned to agent.`;
  } else if (action === "status") {
    const s = status.replace(/_/g, " ");
    title = `${type === "PAYIN" ? "Pay In" : "Pay Out"} — ${s}`;
    body = `Transaction #${id} status changed to ${s}.`;
  } else if (action === "proof") {
    title = `Proof uploaded — ${type === "PAYIN" ? "Pay In" : "Pay Out"}`;
    body = `Payment proof submitted for transaction #${id}.`;
  } else {
    return null;
  }

  return {
    id: `${id}-${action}-${updatedAt}`,
    kind,
    title,
    body,
    href,
    createdAt: updatedAt,
    read: false,
    txId: id,
    status,
  };
}

function buildFromUser(payload: UserRealtimePayload): AppNotification {
  const { userId, role, status, updatedAt } = payload;
  return {
    id: `user-${userId}-${updatedAt}`,
    kind: "user",
    title: `${role.charAt(0).toUpperCase() + role.slice(1)} account updated`,
    body: `User #${userId} status changed to ${status.replace(/_/g, " ")}.`,
    href: role === "agent" ? "/agent" : "/companies",
    createdAt: updatedAt,
    read: false,
  };
}

/* ── Provider ──────────────────────────────────────────────────── */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { subscribe } = useRealtime();
  const { user } = useAuth();
  const key = storageKey(user?.id);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const keyRef = useRef(key);

  // Load on mount / user change
  useEffect(() => {
    const k = storageKey(user?.id);
    keyRef.current = k;
    setNotifications(loadFromStorage(k));
  }, [user?.id]);

  // Persist on change
  useEffect(() => {
    if (notifications.length > 0 || typeof window !== "undefined") {
      saveToStorage(keyRef.current, notifications);
    }
  }, [notifications]);

  // Listen to realtime
  useEffect(() => {
    return subscribe((payload) => {
      let notif: AppNotification | null = null;
      if (payload.type === "transaction") {
        notif = buildFromTx(payload.data, user?.role ?? "admin");
      } else if (payload.type === "user") {
        notif = buildFromUser(payload.data);
      }
      if (!notif) return;
      const newNotif = notif;
      setNotifications((prev) => {
        // Deduplicate by id
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) return prev;
        const next = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveToStorage(keyRef.current, next);
        return next;
      });
    });
  }, [subscribe, user?.role]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      markRead: () => {},
      markAllRead: () => {},
      clearAll: () => {},
    };
  }
  return ctx;
}
