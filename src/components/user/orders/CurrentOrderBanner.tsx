import React from "react";
import Link from "next/link";
import { getCurrentOrder } from "@/data/user/orders";
import OrderStatusBadge from "./OrderStatusBadge";

export default function CurrentOrderBanner() {
  const order = getCurrentOrder();

  if (!order) return null;

  return (
    <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Current Order
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {order.id} · ETA: {order.eta}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {order.deliveryAddress}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <Link
            href={`/user/track?orderId=${order.id}`}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Track Now
          </Link>
        </div>
      </div>
    </div>
  );
}
