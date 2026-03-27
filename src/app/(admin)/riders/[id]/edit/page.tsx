"use client";
import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useRouter, useParams } from "next/navigation";

export default function EditRider() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    nid: "",
    status: "active",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ];

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const response = await fetch(`/api/riders/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch rider");

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          password: "",
          nid: data.nid || "",
          status: data.status || "active",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchRider();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = { ...form };
      if (!body.password) delete body.password; // Don't update password if blank

      const response = await fetch(`/api/riders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update rider");

      router.push("/riders");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="p-6">Loading rider data...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Edit Rider
        </h2>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
          Update rider information. Leave password blank to keep the current one.
        </p>
      </div>

      <ComponentCard title="Rider Information">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Full Name <span className="text-error-500">*</span></Label>
              <Input
                type="text"
                placeholder="Enter rider name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Phone Number <span className="text-error-500">*</span></Label>
              <Input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="rider@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label>New Password (optional)</Label>
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>National ID / NID</Label>
              <Input
                type="text"
                placeholder="Enter NID number"
                value={form.nid}
                onChange={(e) => handleChange("nid", e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions}
                placeholder={form.status}
                onChange={(val) => handleChange("status", val)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.push("/riders")}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
