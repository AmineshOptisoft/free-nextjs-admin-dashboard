"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getTransactionSocket } from "@/lib/realtime/socket-client";
import { TRANSACTION_UPDATE_EVENT, USER_UPDATE_EVENT, type TransactionRealtimePayload, type UserRealtimePayload } from "@/lib/realtime/types";
import { useAuth } from "./AuthContext";

type ListenerPayload = { type: "transaction"; data: TransactionRealtimePayload } | { type: "user"; data: UserRealtimePayload };
type Listener = (payload: ListenerPayload) => void;

type RealtimeContextValue = {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Set<Listener>());

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    let mounted = true;
    let socket = getTransactionSocket();

    const onConnect = () => {
      if (mounted) setConnected(true);
    };
    const onDisconnect = () => {
      if (mounted) setConnected(false);
    };
    const onUpdate = (payload: TransactionRealtimePayload) => {
      for (const fn of listenersRef.current) {
        try {
          fn({ type: "transaction", data: payload });
        } catch (e) {
          console.error("[realtime] listener error", e);
        }
      }
    };
    const onUserUpdate = (payload: UserRealtimePayload) => {
      for (const fn of listenersRef.current) {
        try {
          fn({ type: "user", data: payload });
        } catch (e) {
          console.error("[realtime] listener error", e);
        }
      }
    };

    socket = getTransactionSocket();
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off(TRANSACTION_UPDATE_EVENT, onUpdate);
    socket.off(USER_UPDATE_EVENT, onUserUpdate);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(TRANSACTION_UPDATE_EVENT, onUpdate);
    socket.on(USER_UPDATE_EVENT, onUserUpdate);
    
    if (!socket.connected) socket.connect();
    else setConnected(true);

    return () => {
      mounted = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(TRANSACTION_UPDATE_EVENT, onUpdate);
      socket.off(USER_UPDATE_EVENT, onUserUpdate);
    };
  }, [user, authLoading]);

  return (
    <RealtimeContext.Provider value={{ connected, subscribe }}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    return {
      connected: false,
      subscribe: () => () => {},
    };
  }
  return ctx;
}
