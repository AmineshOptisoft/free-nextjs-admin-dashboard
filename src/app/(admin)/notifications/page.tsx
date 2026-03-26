"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";

interface Notification {
  id: string;
  type: "Order" | "Delivery" | "Dispatch" | "System";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  entityName?: string;
  entityId?: string;
  entityType?: "customer" | "order" | "rider";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "Order",
    title: "New Order Received",
    message: "Order #ORD-007 has been placed by ",
    entityName: "Sarah Jenkins",
    entityId: "CUST-007",
    entityType: "customer",
    time: "2 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "Delivery",
    title: "Delivery Completed",
    message: "Rider Mike Swift has delivered ",
    entityName: "Order #ORD-1001",
    entityId: "ORD-1001",
    entityType: "order",
    time: "15 min ago",
    isRead: false,
  },
  {
    id: "3",
    type: "Dispatch",
    title: "Rider Assigned",
    message: "Leo Bolt has been assigned to ",
    entityName: "Order #ORD-1005",
    entityId: "ORD-1005",
    entityType: "order",
    time: "25 min ago",
    isRead: true,
  },
  {
    id: "4",
    type: "Order",
    title: "Order Cancelled",
    message: "Order #ORD-1012 has been cancelled by ",
    entityName: "Robert Johnson",
    entityId: "CUST-003",
    entityType: "customer",
    time: "1 hour ago",
    isRead: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with the latest activities in your delivery system.
          </p>
        </div>
        <button className="text-sm font-medium text-brand-500 hover:underline">
          Mark all as read
        </button>
      </div>

      <ComponentCard title="All Notifications">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                !notification.isRead ? "bg-brand-50/30 dark:bg-brand-500/5" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-10 w-full max-w-10 items-center justify-center rounded-full text-white ${
                  notification.type === "Order" ? "bg-brand-500" :
                  notification.type === "Delivery" ? "bg-success-500" :
                  notification.type === "Dispatch" ? "bg-info-500" : "bg-gray-500"
                }`}>
                  {notification.type === "Order" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
                  {notification.type === "Delivery" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}
                  {notification.type === "Dispatch" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                    {notification.entityName && notification.entityId && (
                      <Link
                        href={notification.entityType === "customer" 
                          ? `/customers/${notification.entityId}` 
                          : `/orders/${notification.entityId}`
                        }
                        className="font-medium text-brand-500 hover:underline"
                      >
                        {notification.entityName}
                      </Link>
                    )}
                  </p>
                  <div className="mt-2">
                    <Badge variant="light" color={
                      notification.type === "Order" ? "primary" :
                      notification.type === "Delivery" ? "success" :
                      notification.type === "Dispatch" ? "info" : "dark"
                    } size="sm">
                      {notification.type}
                    </Badge>
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-brand-500"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}
