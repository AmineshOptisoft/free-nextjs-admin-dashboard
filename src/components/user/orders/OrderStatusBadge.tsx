import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS } from "@/lib/constants";

export default function OrderStatusBadge({ status }: { status: number }) {
  const label = ORDER_STATUS_LABELS[status] || "Unknown";

  if (status === ORDER_STATUS.DELIVERED) {
    return (
      <Badge size="sm" color="success">
        {label}
      </Badge>
    );
  }

  if (status === ORDER_STATUS.CANCELED) {
    return (
      <Badge size="sm" color="error">
        {label}
      </Badge>
    );
  }

  return (
    <Badge size="sm" color="warning">
      {label}
    </Badge>
  );
}
