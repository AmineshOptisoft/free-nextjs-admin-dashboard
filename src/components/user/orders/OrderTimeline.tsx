import React from "react";
import type { OrderStatus } from "@/data/user/orders";

const stages: OrderStatus[] = [
  "Placed",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = stages.indexOf(status);

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const done = currentIndex >= index || status === "Delivered";
        return (
          <div key={stage} className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                done ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
            <p
              className={`text-sm ${
                done
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {stage}
            </p>
          </div>
        );
      })}
    </div>
  );
}
