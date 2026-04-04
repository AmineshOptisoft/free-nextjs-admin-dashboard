"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { UserContext } from "@/context/UserContext";

const ORDER_STATUS: Record<number, string> = {
  0: "Pending",
  1: "Accepted",
  2: "Arrived",
  3: "Started",
  4: "Delivered",
  5: "Canceled",
};

function statusLabel(status: unknown): string {
  if (typeof status === "number") return ORDER_STATUS[status] ?? String(status);
  return String(status ?? "—");
}

export default function CustomerDashboardPage() {
  const { user: activeUser, logout } = useContext(UserContext) as any;
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeUser) {
      setOrders([]);
      setActiveOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/orders?customerId=${activeUser.id}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/customers/${activeUser.id}/active-order`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([orderList, activeData]) => {
        if (Array.isArray(orderList)) setOrders(orderList);
        else setOrders([]);
        setActiveOrder(activeData?.activeOrder ?? null);
      })
      .catch(() => {
        setOrders([]);
        setActiveOrder(null);
      })
      .finally(() => setLoading(false));
  }, [activeUser]);

  if (!activeUser) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
        <div className="text-6xl">👤</div>
        <h2 className="text-xl font-bold dark:text-white">Login required</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          First log in using the customer account (on the homepage) to access the dashboard.
        </p>
        <Link
          href="/user"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Go to Home & Login
        </Link>
      </div>
    );
  }

  const completed = orders.filter((o) => {
    const s = o.status;
    if (typeof s === "number") return s === 4;
    return s === "Delivered" || s === "Completed";
  }).length;

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeUser.firstName} {activeUser.lastName} · {activeUser.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Logout
          </button>
        </div>
      </div>

      {activeOrder && (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700 p-5">
          <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Active ride</p>
          <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
            Order #{activeOrder.id} · {statusLabel(activeOrder.status)}
          </p>
          <Link
            href={`/user/track/${activeOrder.id}`}
            className="mt-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
          >
            Track ride
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total rides</p>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-extrabold text-green-600">{completed}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white truncate" title={activeUser.email}>
            {activeUser.email}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Profile</p>
          <Link href="/user/profile" className="text-sm font-bold text-brand-600 hover:underline">
            Edit details
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/user/book-ride"
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          Book a ride
        </Link>
        <Link
          href="/user/orders"
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          All orders
        </Link>
        <Link
          href="/user/track"
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Track
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Recent orders</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet. Book your first ride!</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    #ORD-{String(o.id).padStart(3, "0")}
                  </p>
                  <p className="text-xs text-gray-500">{statusLabel(o.status)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600">
                    ₹{o.amount != null ? Number(o.amount).toFixed(0) : "—"}
                  </p>
                  <Link href={`/user/track/${o.id}`} className="text-xs text-brand-500 hover:underline">
                    Track
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
