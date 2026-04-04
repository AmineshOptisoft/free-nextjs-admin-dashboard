"use client";

import React, { useState, useEffect, useContext } from "react";
import OrderCard from "@/components/user/orders/OrderCard";
import { UserContext } from "@/context/UserContext";

import { ORDER_STATUS } from "@/lib/constants";

export default function UserOrdersPage() {
  const { user: activeUser } = useContext(UserContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeUser) {
      setOrders([]);
      return;
    }
    
    setLoading(true);
    fetch(`/api/orders?customerId=${activeUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .finally(() => setLoading(false));
  }, [activeUser]);

  const active = orders.filter((o) =>
    [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED, ORDER_STATUS.ARRIVED, ORDER_STATUS.STARTED].includes(o.status)
  );
  const completed = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);
  const cancelled = orders.filter((o) => o.status === ORDER_STATUS.CANCELED);

  if (!activeUser) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="text-6xl">👤</div>
        <h2 className="text-xl font-bold dark:text-white">Please select a profile</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Select a profile from the bar at the top to see your order history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Orders</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Showing orders for <span className="font-bold text-brand-600">{activeUser.firstName}</span>
        </p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400 italic">Syncing with database...</div>
      ) : (
        <>
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Active {active.length > 0 && `(${active.length})`}</h3>
            {active.length ? active.map((order) => <OrderCard key={order.id} order={order} />) : (
               <p className="text-sm text-gray-500 dark:text-gray-400">No active orders.</p>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Completed {completed.length > 0 && `(${completed.length})`}</h3>
            {completed.length ? (
              completed.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No completed orders yet.</p>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Cancelled {cancelled.length > 0 && `(${cancelled.length})`}</h3>
            {cancelled.length ? (
              cancelled.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No cancelled orders.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
