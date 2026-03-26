import React from "react";
import OrderCard from "@/components/user/orders/OrderCard";
import { userOrders } from "@/data/user/orders";

export default function UserOrdersPage() {
  const active = userOrders.filter((o) =>
    ["Placed", "Picked Up", "Out for Delivery"].includes(o.status)
  );
  const completed = userOrders.filter((o) => o.status === "Delivered");
  const cancelled = userOrders.filter((o) => o.status === "Cancelled");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Orders</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track active orders and review your order history.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Active</h3>
        {active.length ? active.map((order) => <OrderCard key={order.id} order={order} />) : null}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Completed</h3>
        {completed.length ? (
          completed.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No completed orders yet.</p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Cancelled</h3>
        {cancelled.length ? (
          cancelled.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No cancelled orders.</p>
        )}
      </section>
    </div>
  );
}
