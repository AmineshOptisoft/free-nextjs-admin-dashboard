import React from "react";
import { getCurrentOrder } from "@/data/user/orders";
import OrderTimeline from "@/components/user/orders/OrderTimeline";

export default function UserTrackPage() {
  const currentOrder = getCurrentOrder();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Track Order</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live order status and rider details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Live Map (Placeholder)
          </h3>
          <div className="mt-4 flex h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-400">
            Map integration will be added in API phase.
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Current Progress
            </h3>
            <div className="mt-4">
              <OrderTimeline status={currentOrder.status} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Rider</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {currentOrder.rider.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentOrder.rider.phone}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle: {currentOrder.rider.vehicleCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
