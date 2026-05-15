"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getTransactionSocket } from "@/lib/realtime/socket-client";
import { TRANSACTION_UPDATE_EVENT, type TransactionRealtimePayload } from "@/lib/realtime/types";

type Listener = (payload: TransactionRealtimePayload) => void;

type RealtimeContextValue = {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Set<Listener>());

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
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
          fn(payload);
        } catch (e) {
          console.error("[realtime] listener error", e);
        }
      }
    };

    const setup = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!mounted || !res.ok) return;
        const data = (await res.json()) as { ok?: boolean };
        if (!data.ok) return;

        socket = getTransactionSocket();
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off(TRANSACTION_UPDATE_EVENT, onUpdate);
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on(TRANSACTION_UPDATE_EVENT, onUpdate);
        if (!socket.connected) socket.connect();
        else setConnected(true);
      } catch {
        // not signed in or network error
      }
    };

    void setup();

    return () => {
      mounted = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(TRANSACTION_UPDATE_EVENT, onUpdate);
    };
  }, []);

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
