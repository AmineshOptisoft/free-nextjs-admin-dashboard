"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Form from "@/components/form/Form";

export default function CreateOrder() {
  const paymentOptions = [
    { value: "Cash", label: "Cash on Delivery" },
    { value: "Online", label: "Online Payment" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mock submit
    alert("Order Created Successfully (Mock)");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Create New Order
        </h2>
      </div>

      <ComponentCard title="Order Details">
        <Form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Customer Name</Label>
              <Input type="text" placeholder="Enter customer name" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input type="text" placeholder="Enter phone number" />
            </div>
          </div>

          <div>
            <Label>Pickup Address</Label>
            <TextArea placeholder="Enter pickup address" rows={3} />
          </div>

          <div>
            <Label>Delivery Address</Label>
            <TextArea placeholder="Enter delivery address" rows={3} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Payment Type</Label>
              <Select
                options={paymentOptions}
                placeholder="Select payment type"
                onChange={(val) => console.log(val)}
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <TextArea placeholder="Add any special instructions" rows={2} />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
            >
              Create Order
            </button>
          </div>
        </Form>
      </ComponentCard>
    </div>
  );
}
