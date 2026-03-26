"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  status: "Delivered" | "Pending" | "Canceled" | "On the way";
  rider: string;
  date: string;
}

const tableData: Order[] = [
  {
    id: "#ORD-001",
    customerName: "John Doe",
    phone: "+1 234 567 890",
    status: "Delivered",
    rider: "Mike Swift",
    date: "2024-03-26",
  },
  {
    id: "#ORD-002",
    customerName: "Alice Smith",
    phone: "+1 234 567 891",
    status: "On the way",
    rider: "Leo Bolt",
    date: "2024-03-26",
  },
  {
    id: "#ORD-003",
    customerName: "Bob Wilson",
    phone: "+1 234 567 892",
    status: "Pending",
    rider: "Sarah Dash",
    date: "2024-03-25",
  },
  {
    id: "#ORD-004",
    customerName: "Eva Brown",
    phone: "+1 234 567 893",
    status: "Delivered",
    rider: "Tom Racer",
    date: "2024-03-25",
  },
  {
    id: "#ORD-005",
    customerName: "Chris Green",
    phone: "+1 234 567 894",
    status: "Canceled",
    rider: "None",
    date: "2024-03-24",
  },
  {
    id: "#ORD-006",
    customerName: "David Miller",
    phone: "+1 234 567 895",
    status: "Pending",
    rider: "Mike Swift",
    date: "2024-03-24",
  },
];

export default function OrdersList() {
  const [statusFilter, setStatusFilter] = useState("");

  const statusOptions = [
    { value: "Delivered", label: "Delivered" },
    { value: "Pending", label: "Pending" },
    { value: "On the way", label: "On the way" },
    { value: "Canceled", label: "Canceled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Orders List
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              placeholder="Filter by Status"
              onChange={(value) => setStatusFilter(value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <DatePicker id="order-date" placeholder="Select Date" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Order ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Customer Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Phone
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Rider
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          order.status === "Delivered"
                            ? "success"
                            : order.status === "Pending"
                            ? "warning"
                            : order.status === "On the way"
                            ? "info"
                            : "error"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.rider}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
