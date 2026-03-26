import React from "react";

const notifications = [
  {
    id: "N-1",
    title: "Order ORD-1001 is out for delivery",
    description: "Your rider is nearby and will reach in around 20 minutes.",
    time: "2 mins ago",
  },
  {
    id: "N-2",
    title: "Payment successful",
    description: "You paid $38.50 for order ORD-1001 via UPI.",
    time: "15 mins ago",
  },
  {
    id: "N-3",
    title: "Promo unlocked",
    description: "Use code GREEN10 on your next order to save 10%.",
    time: "1 day ago",
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          All updates related to your orders and account.
        </p>
      </div>
      <div className="space-y-3">
        {notifications.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {note.title}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {note.description}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{note.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
