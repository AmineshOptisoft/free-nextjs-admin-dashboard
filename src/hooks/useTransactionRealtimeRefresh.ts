"use client";

import { useEffect, useRef } from "react";
import { useRealtime } from "@/context/RealtimeContext";
import { useAuth, UserSession } from "@/context/AuthContext";
import type { TransactionRealtimePayload } from "@/lib/realtime/types";

function shouldRefresh(payload: TransactionRealtimePayload, user: UserSession | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "agent") {
    return payload.assignedAgentId != null && String(payload.assignedAgentId) === user.id;
  }
  if (user.role === "company") {
    return payload.companyId != null && String(payload.companyId) === user.id;
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
  const { user } = useAuth();
  const onRefreshRef = useRef(opts.onRefresh);
  onRefreshRef.current = opts.onRefresh;

  useEffect(() => {
    return subscribe((payload) => {
      if (payload.type !== "transaction") return;
      const data = payload.data;
      if (opts.types && !opts.types.includes(data.type)) return;

      if (shouldRefresh(data, user)) {
        onRefreshRef.current();
      }
    });
  }, [subscribe, opts.types, user]);
}
