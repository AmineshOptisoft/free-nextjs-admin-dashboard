import React from "react";
import Link from "next/link";
import type { Order } from "@/data/user/orders";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {order.id}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{order.createdAt}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">ETA</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{order.eta}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ${order.totalAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rider</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{order.rider.name}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        <Link
          href={`/user/orders/${order.id}`}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          View Details
        </Link>
        <Link
          href={`/user/track?orderId=${order.id}`}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Track
        </Link>
      </div>
    </div>
  );
}
