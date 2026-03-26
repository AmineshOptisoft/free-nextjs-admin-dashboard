"use client";

import React, { FormEvent, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

type EbikeStatus = "Available" | "In Use" | "Maintenance";

type Ebike = {
  code: string;
  numberPlate: string;
  model: string;
  batteryHealth: string;
  status: EbikeStatus;
  imageName: string;
};

const INITIAL_EBIKES: Ebike[] = [
  {
    code: "EBK-001",
    numberPlate: "DL-01-AB-1234",
    model: "Hero Optima CX",
    batteryHealth: "92%",
    status: "Available",
    imageName: "ebike-001.jpg",
  },
  {
    code: "EBK-002",
    numberPlate: "DL-01-CD-5678",
    model: "Ather 450S",
    batteryHealth: "86%",
    status: "In Use",
    imageName: "ebike-002.jpg",
  },
  {
    code: "EBK-003",
    numberPlate: "DL-01-EF-9214",
    model: "Ola S1 X",
    batteryHealth: "74%",
    status: "Maintenance",
    imageName: "ebike-003.jpg",
  },
];

export default function EbikesPage() {
  const [ebikes, setEbikes] = useState<Ebike[]>(INITIAL_EBIKES);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [code, setCode] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [model, setModel] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [status, setStatus] = useState<EbikeStatus>("Available");
  const [imageName, setImageName] = useState("");

  const resetForm = () => {
    setCode("");
    setNumberPlate("");
    setModel("");
    setBatteryHealth("");
    setStatus("Available");
    setImageName("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextEbike: Ebike = {
      code,
      numberPlate,
      model,
      batteryHealth,
      status,
      imageName: imageName || "uploaded-image",
    };

    setEbikes((prev) => [nextEbike, ...prev]);
    resetForm();
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          E-Bikes List
        </h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Add New E-Bike
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Code
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Number Plate
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Model
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Battery Health
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Image
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {ebikes.map((bike) => (
                  <TableRow key={bike.code}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {bike.code}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {bike.numberPlate}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {bike.model}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {bike.batteryHealth}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {bike.imageName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          bike.status === "Available"
                            ? "success"
                            : bike.status === "In Use"
                              ? "warning"
                              : "dark"
                        }
                      >
                        {bike.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[100] ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          aria-label="Close add e-bike panel"
          className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsDrawerOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 shadow-xl transition-transform duration-300 dark:bg-gray-900 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Add New E-Bike
            </h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              Close
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="e.g. EBK-010"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number Plate
              </label>
              <input
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
                required
                placeholder="e.g. DL-01-AB-1234"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageName(e.target.files?.[0]?.name ?? "")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 dark:border-gray-700 dark:bg-transparent dark:text-gray-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Model (Others)
              </label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Ather 450X"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Battery Health
              </label>
              <input
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                placeholder="e.g. 90%"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EbikeStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsDrawerOpen(false);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Save E-Bike
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

