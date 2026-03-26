import React from "react";
import Link from "next/link";
import { getOrderById } from "@/data/user/orders";
import OrderStatusBadge from "@/components/user/orders/OrderStatusBadge";
import OrderTimeline from "@/components/user/orders/OrderTimeline";

export default async function UserOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Order not found
        </h2>
        <Link
          href="/user/orders"
          className="mt-4 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Order Details
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {order.id} · {order.createdAt}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Items</h3>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name} x{item.qty}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Status Timeline
            </h3>
            <div className="mt-4">
              <OrderTimeline status={order.status} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Rider</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{order.rider.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.rider.phone}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Vehicle: {order.rider.vehicleCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
