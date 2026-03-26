"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import { useParams } from "next/navigation";

export default function OrderDetails() {
  const params = useParams();
  const id = params?.id as string;

  const orderData = {
    id: id || "#ORD-001",
    customer: {
      name: "John Doe",
      phone: "+1 234 567 890",
      email: "john@example.com",
    },
    pickup: "123 Central Ave, Downtown, City",
    delivery: "456 Side Street, Suburbs, City",
    rider: {
      name: "Mike Swift",
      phone: "+1 987 654 321",
      status: "Available",
    },
    payment: "Cash on Delivery",
    total: "$25.00",
    timeline: [
      { status: "Order Placed", time: "2024-03-26 10:00 AM", completed: true },
      { status: "Rider Assigned", time: "2024-03-26 10:15 AM", completed: true },
      { status: "Picked Up", time: "2024-03-26 10:30 AM", completed: true },
      { status: "On the way", time: "2024-03-26 10:45 AM", completed: true },
      { status: "Delivered", time: "Pending", completed: false },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Order Details: {orderData.id}
        </h2>
        <Badge color="info">In Progress</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Customer & Rider Info */}
        <div className="lg:col-span-2 space-y-6">
          <ComponentCard title="Customer Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{orderData.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{orderData.customer.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{orderData.customer.email}</p>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Delivery Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pickup Address</p>
                <p className="text-gray-600 dark:text-gray-400">{orderData.pickup}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Address</p>
                <p className="text-gray-600 dark:text-gray-400">{orderData.delivery}</p>
              </div>
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Type</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{orderData.payment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-brand-500">{orderData.total}</p>
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Rider Assigned">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                  MS
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white/90">{orderData.rider.name}</p>
                  <p className="text-sm text-gray-500">{orderData.rider.phone}</p>
                </div>
                <Badge color="success">{orderData.rider.status}</Badge>
             </div>
          </ComponentCard>
        </div>

        {/* Right Column: Status Timeline */}
        <div className="space-y-6">
          <ComponentCard title="Order Status Timeline">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gray-200 dark:before:bg-gray-800">
              {orderData.timeline.map((step, index) => (
                <div key={index} className="relative flex items-center justify-between pl-10">
                  <div className={`absolute left-0 h-10 w-10 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center ${step.completed ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {step.completed ? (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current"></span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{step.status}</p>
                    <p className="text-xs text-gray-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
