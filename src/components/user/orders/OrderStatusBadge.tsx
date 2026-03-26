import React from "react";
import Badge from "@/components/ui/badge/Badge";
import type { OrderStatus } from "@/data/user/orders";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "Delivered") {
    return (
      <Badge size="sm" color="success">
        {status}
      </Badge>
    );
  }

  if (status === "Cancelled") {
    return (
      <Badge size="sm" color="error">
        {status}
      </Badge>
    );
  }

  return (
    <Badge size="sm" color="warning">
      {status}
    </Badge>
  );
}
