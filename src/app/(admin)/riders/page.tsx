"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import Link from "next/link";

interface Rider {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  _count: {
    trips: number;
  };
}

export default function RiderList() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRiders = async () => {
    try {
      const response = await fetch("/api/riders");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch riders");
      setRiders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rider?")) return;

    try {
      const response = await fetch(`/api/riders/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete rider");
      
      setRiders((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ];

  if (loading) return <div className="p-6">Loading riders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Rider Management
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              placeholder="Filter by Status"
              onChange={(val) => console.log(val)}
            />
          </div>
          <Link
            href="/riders/add"
            className="flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Add New Rider
          </Link>
        </div>
      </div>

      {error && <div className="p-4 text-error-600 bg-error-50 rounded-lg">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Phone
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trips
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {riders.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{rider.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {rider.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {rider.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          rider.status === "active"
                            ? "success"
                            : "warning"
                        }
                      >
                        {rider.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {rider._count.trips}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/riders/${rider.id}/edit`}
                          className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(rider.id)}
                          className="text-error-500 hover:text-error-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {riders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-10 text-center text-gray-500">
                      No riders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
