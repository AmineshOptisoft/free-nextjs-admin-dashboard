"use client";

import { useEffect, useRef } from "react";
import { useRealtime } from "@/context/RealtimeContext";
import type { TransactionRealtimePayload } from "@/lib/realtime/types";

type MeResponse = {
  ok?: boolean;
  role?: "admin" | "agent" | "company";
  agentId?: number;
  companyId?: number;
};

function shouldRefresh(payload: TransactionRealtimePayload, me: MeResponse | null): boolean {
  if (!me?.ok || !me.role) return false;
  if (me.role === "admin") return true;
  if (me.role === "agent") {
    return payload.assignedAgentId != null && payload.assignedAgentId === me.agentId;
  }
  if (me.role === "company") {
    return payload.companyId != null && payload.companyId === me.companyId;
  }
  return false;
}

/**
 * Refetch list when payin/payout is created, assigned, approved, rejected, or disputed elsewhere.
 */
export function useTransactionRealtimeRefresh(opts: {
  types?: Array<"PAYIN" | "PAYOUT">;
  onRefresh: () => void;
}) {
  const { subscribe } = useRealtime();
  const onRefreshRef = useRef(opts.onRefresh);
  onRefreshRef.current = opts.onRefresh;
  const meRef = useRef<MeResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok || !mounted) return;
        meRef.current = (await res.json()) as MeResponse;
      } catch {
        meRef.current = null;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return subscribe((payload) => {
      if (opts.types && !opts.types.includes(payload.type)) return;

      const run = async () => {
        if (!meRef.current?.ok) {
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.ok) meRef.current = (await res.json()) as MeResponse;
          } catch {
            /* ignore */
          }
        }
        if (!shouldRefresh(payload, meRef.current)) return;
        onRefreshRef.current();
      };

      void run();
    });
  }, [subscribe, opts.types]);
}
