"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";

export default function Tracking() {
  const activeRiders = [
    { id: "RID-001", name: "Mike Swift", order: "#ORD-001", status: "On the way", location: "Downtown" },
    { id: "RID-002", name: "Leo Bolt", order: "#ORD-002", status: "Picking up", location: "Uptown" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Live Delivery Tracking
        </h2>
        <Badge color="success">Live</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Map Placeholder */}
        <div className="lg:col-span-3">
          <div className="relative h-[600px] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 opacity-20">
               {/* Mock Map Grid */}
               <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                 {Array.from({ length: 100 }).map((_, i) => (
                   <div key={i} className="border-[0.5px] border-gray-400"></div>
                 ))}
               </div>
            </div>
            <div className="text-center z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Map View Placeholder</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm italic">Real map integration (Google Maps / Mapbox) would be implemented here in a production environment.</p>
            </div>

            {/* Mock Rider Pins */}
            <div className="absolute top-1/4 left-1/3">
               <div className="relative group cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-brand-500 border-2 border-white animate-pulse"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    Mike Swift - #ORD-001
                  </div>
               </div>
            </div>
            <div className="absolute top-1/2 right-1/4">
               <div className="relative group cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-warning-500 border-2 border-white"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    Leo Bolt - #ORD-002
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          <ComponentCard title="Active Riders">
             <div className="space-y-4">
                {activeRiders.map((rider) => (
                  <div key={rider.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                       <p className="font-semibold text-gray-800 dark:text-white/90">{rider.name}</p>
                       <Badge size="sm" color={rider.status === "On the way" ? "info" : "warning"}>{rider.status}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                       <span>Order: <span className="text-brand-500 font-medium">{rider.order}</span></span>
                       <span>Loc: {rider.location}</span>
                    </div>
                  </div>
                ))}
             </div>
          </ComponentCard>

          <ComponentCard title="Live Stats">
             <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                   <span className="text-sm text-gray-500">Online Riders</span>
                   <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                   <span className="text-sm text-gray-500">Pickups Pending</span>
                   <span className="font-bold text-warning-500">4</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-sm text-gray-500">Avg. Delivery Time</span>
                   <span className="font-bold text-success-500">18 min</span>
                </div>
             </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
