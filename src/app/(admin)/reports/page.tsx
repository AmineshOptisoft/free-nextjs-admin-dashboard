"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Delivery Reports & Analytics
        </h2>
        <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 11V13H12V11M8 3V9M8 9L5 6M8 9L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         {/* Reusing existing chart components but they show our updated data */}
         <div className="col-span-1">
            <MonthlySalesChart />
         </div>
         <div className="col-span-1">
            <StatisticsChart />
         </div>

         <div className="lg:col-span-2">
            <ComponentCard title="Orders Summary (Monthly)">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                     <p className="text-sm text-gray-500">Total Deliveries</p>
                     <p className="text-2xl font-bold text-gray-800 dark:text-white">8,429</p>
                     <p className="text-xs text-success-500 mt-1">↑ 14% vs last month</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                     <p className="text-sm text-gray-500">Completion Rate</p>
                     <p className="text-2xl font-bold text-gray-800 dark:text-white">96.8%</p>
                     <p className="text-xs text-success-500 mt-1">↑ 2.1% vs last month</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                     <p className="text-sm text-gray-500">Cancelled Orders</p>
                     <p className="text-2xl font-bold text-gray-800 dark:text-white">142</p>
                     <p className="text-xs text-error-500 mt-1">↓ 5% vs last month</p>
                  </div>
               </div>
            </ComponentCard>
         </div>
      </div>
    </div>
  );
}
