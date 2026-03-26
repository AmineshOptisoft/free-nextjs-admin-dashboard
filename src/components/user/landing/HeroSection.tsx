import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="overflow-hidden rounded-3xl border border-brand-100 bg-linear-to-br from-brand-500 to-brand-700 p-6 text-white dark:border-brand-500/20 md:p-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            Kandi E-Bike Delivery
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
            Anything delivered in minutes, across your city.
          </h1>
          <p className="mt-4 max-w-xl text-white/90">
            Groceries, meals, pharmacy, and daily essentials with live rider
            tracking and eco-friendly e-bike delivery.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/user/orders"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-gray-100"
            >
              Start Ordering
            </Link>
            <Link
              href="/user/track"
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Track My Order
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 text-gray-800 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Quick Search
          </p>
          <div className="mt-3 flex gap-2">
            <input
              placeholder="Search restaurants, stores, items..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button className="rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600">
              Go
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Food", "Groceries", "Pharmacy", "Stationery", "Snacks"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Delivery to</p>
            <p className="text-sm font-semibold">Green Park, New Delhi</p>
          </div>
        </div>
      </div>
    </section>
  );
}
