"use client";
import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import {
  MoreDotIcon,
  UserCircleIcon,
} from "@/icons";
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  image?: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    });
    setError("");
    setIsEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditMode ? `/api/customers/${formData.id}` : '/api/customers';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCustomers();
        toggleDrawer();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      id: customer.id,
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      street: customer.street || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
    });
    setIsEditMode(true);
    setIsDrawerOpen(true);
    setDropdownOpenId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    }
    setDropdownOpenId(null);
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <button
          onClick={toggleDrawer}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
        >
          <span>Add New Customer</span>
        </button>
      </div>

      <ComponentCard title="Customer List">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Joined At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-transparent">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/customers/${customer.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800 overflow-hidden">
                           {customer.image ? (
                             <img src={customer.image} alt={customer.firstName} className="w-full h-full object-cover" />
                           ) : (
                             <UserCircleIcon className="w-6 h-6 text-gray-400" />
                           )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {customer.id}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setDropdownOpenId(dropdownOpenId === customer.id ? null : customer.id)}
                          className="text-gray-400 hover:text-brand-500 transition-colors"
                        >
                           <MoreDotIcon className="w-5 h-5" />
                        </button>
                        {dropdownOpenId === customer.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-99999 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={toggleDrawer}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transition-transform transform translate-x-0 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <button
                  onClick={toggleDrawer}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Enter first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Enter last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Enter phone number" />
                </div>
                
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Address Details</h3>
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" value={formData.street} onChange={handleInputChange} placeholder="Enter street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input id="zip" value={formData.zip} onChange={handleInputChange} placeholder="Enter zip code" />
                    </div>
                  </div>
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
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer')}
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
