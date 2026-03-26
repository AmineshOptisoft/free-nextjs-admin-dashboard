"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Form from "@/components/form/Form";

export default function AddRider() {
  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Offline", label: "Offline" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Rider Added Successfully (Mock)");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Add New Rider
        </h2>
      </div>

      <ComponentCard title="Rider Information">
        <Form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input type="text" placeholder="Enter rider name" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input type="text" placeholder="Enter phone number" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Email Address</Label>
              <Input type="email" placeholder="Enter email address" />
            </div>
            <div>
              <Label>Vehicle Number</Label>
              <Input type="text" placeholder="e.g. EB-1234" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Initial Status</Label>
              <Select
                options={statusOptions}
                placeholder="Select status"
                onChange={(val) => console.log(val)}
              />
            </div>
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
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Add Rider
            </button>
          </div>
        </Form>
      </ComponentCard>
    </div>
  );
}
