import React from "react";
import type { SavedAddress } from "@/data/user/profile";
import Badge from "@/components/ui/badge/Badge";

export default function AddressCard({ address }: { address: SavedAddress }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
          {address.label}
        </p>
        {address.isDefault ? (
          <Badge size="sm" color="primary">
            Default
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{address.address}</p>
    </div>
  );
}
