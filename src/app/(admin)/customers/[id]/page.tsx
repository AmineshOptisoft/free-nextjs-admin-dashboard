"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import {
  UserCircleIcon,
} from "@/icons";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock icons as the ones in index.tsx might not include these or have different names
// I'll use standard SVG for info icons if they are missing
const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const mockOrders = [
  { id: "ORD-1001", date: "2026-03-24", quantity: 2, amount: "$45.00", status: "Delivered" },
  { id: "ORD-1005", date: "2026-03-20", quantity: 1, amount: "$25.00", status: "Delivered" },
  { id: "ORD-1012", date: "2026-03-15", quantity: 3, amount: "$65.00", status: "Cancelled" },
];

export default function CustomerDetailsPage() {
  const { id } = useParams();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/customers"
          className="flex items-center justify-center w-10 h-10 text-gray-500 bg-white border border-gray-200 rounded-lg hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="lg:col-span-1">
          <ComponentCard title="Profile Information">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800 mb-4">
                <span className="w-16 h-16 text-gray-400">
                  <UserCircleIcon />
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">John Doe</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{id}</p>

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <EmailIcon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">john.doe@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <PhoneIcon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">+1 234 567 8901</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                   <div className="w-full">
                    <p className="text-xs text-gray-400 mb-1">Shipping Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      123 E-bike Lane, Battery City, <br />
                      Voltage Road, 54321
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Orders Table */}
        <div className="lg:col-span-2">
          <ComponentCard title="Order History">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-transparent">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-500">
                        <Link href={`/orders/${order.id}`}>{order.id}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="light" 
                          color={order.status === "Delivered" ? "success" : "error"}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link href={`/orders/${order.id}`} className="text-brand-500 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ComponentCard>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
               <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">$135.00</h3>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
               <p className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</p>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">$45.00</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
