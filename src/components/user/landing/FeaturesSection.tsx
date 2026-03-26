import React from "react";
import { landingFeatures, landingStats } from "@/data/user/landing";

export default function FeaturesSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Popular Categories & Benefits
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Designed for fast urban delivery with a smooth customer experience.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          "Restaurants",
          "Groceries",
          "Pharmacy",
          "Bakery",
          "Pet Supplies",
        ].map((category) => (
          <div
            key={category}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-brand-200 hover:text-brand-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300"
          >
            {category}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {landingFeatures.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {landingStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-500/20 dark:bg-brand-500/10"
          >
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
