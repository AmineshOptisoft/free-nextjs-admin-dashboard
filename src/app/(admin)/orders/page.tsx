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
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { MoreDotIcon } from "@/icons";

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    customerId: "",
    riderId: "",
    status: "Pending",
    date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, clientsRes, ridersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/riders')
      ]);
      
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (clientsRes.ok) setCustomers(await clientsRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());

    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      customerId: "",
      riderId: "",
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
    });
    setError("");
    setIsEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditMode ? `/api/orders/${formData.id}` : '/api/orders';
      const method = isEditMode ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        riderId: formData.riderId ? parseInt(formData.riderId) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchData();
        toggleDrawer();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${isEditMode ? 'update' : 'create'} order`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (order: any) => {
    setFormData({
      id: order.id,
      customerId: order.customerId?.toString() || "",
      riderId: order.riderId?.toString() || "",
      status: order.status || "Pending",
      date: new Date(order.date).toISOString().split('T')[0],
    });
    setIsEditMode(true);
    setIsDrawerOpen(true);
    setDropdownOpenId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      console.error(err);
    }
    setDropdownOpenId(null);
  };

  return (
    <div className="space-y-6 relative min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Orders List</h2>
        <button
          onClick={toggleDrawer}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
        >
          <span>Add New Order</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto min-h-[400px]">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Order ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Customer Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rider</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-right text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10">Loading orders...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10">No orders found.</TableCell></TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        #ORD-{order.id.toString().padStart(3, '0')}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {order.customer?.phone || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge
                          size="sm"
                          color={
                            order.status === "Delivered" ? "success"
                              : order.status === "Pending" ? "warning"
                              : order.status === "On the way" ? "info"
                              : "error"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {order.rider ? `${order.rider.name}` : "Unassigned"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right text-sm relative">
                        <div className="inline-block relative text-left">
                          <button 
                            onClick={() => setDropdownOpenId(dropdownOpenId === order.id ? null : order.id)}
                            className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
                          >
                             <MoreDotIcon className="w-5 h-5" />
                          </button>
                          {dropdownOpenId === order.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(order)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-99999 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={toggleDrawer} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transition-transform transform translate-x-0 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? 'Edit Order' : 'Add New Order'}
                </h2>
                <button
                  onClick={toggleDrawer}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  &times;
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <select
                    id="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange as any}
                    required
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="" disabled>Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="riderId">Assign Rider (Optional)</Label>
                  <select
                    id="riderId"
                    value={formData.riderId}
                    onChange={handleInputChange as any}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange as any}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="On the way">On the way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date">Order Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={toggleDrawer}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Order' : 'Save Order')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
