import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { ORDER_STATUS, RIDER_STATUS } from "@/lib/constants";

export async function GET() {
  try {
    const [
      totalOrders,
      activeDeliveries,
      completedOrders,
      cancelledOrders,
      availableRiders,
      totalRevenue,
      totalCustomers
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.ARRIVED, ORDER_STATUS.STARTED] }
        }
      }),
      prisma.order.count({
        where: { status: ORDER_STATUS.DELIVERED }
      }),
      prisma.order.count({
        where: { status: ORDER_STATUS.CANCELED }
      }),
      prisma.rider.count({
        where: { status: RIDER_STATUS.ACTIVE }
      }),
      prisma.order.aggregate({
        where: { status: ORDER_STATUS.DELIVERED },
        _sum: { amount: true }
      }),
      prisma.customer.count()
    ]);

    const completionRate = totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      totalOrders,
      activeDeliveries,
      completedOrders,
      cancelledOrders,
      availableRiders,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalCustomers,
      completionRate
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
