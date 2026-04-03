import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/earnings:
 *   get:
 *     tags:
 *       - Rider Actions
 *     summary: Get rider earnings summary
 *     description: Returns total earnings, today's earnings, completed trip count, and recent order history.
 *     parameters:
 *       - in: query
 *         name: riderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The rider ID
 *     responses:
 *       200:
 *         description: Earnings fetched successfully
 *       400:
 *         description: riderId is required
 *       404:
 *         description: Rider not found
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get('riderId');

    if (!riderId) {
      return NextResponse.json({ error: 'riderId is required' }, { status: 400 });
    }

    const rider = await prisma.rider.findUnique({ where: { id: parseInt(riderId) } });
    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    // All completed orders for this rider
    const completedOrders = await prisma.order.findMany({
      where: { riderId: parseInt(riderId), status: { in: [4] } }, // 4 = Delivered
      orderBy: { createdAt: 'desc' },
      select: { id: true, amount: true, pickupLoc: true, dropLoc: true, paymentMode: true, createdAt: true }
    });

    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = completedOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekOrders = completedOrders.filter(o => new Date(o.createdAt) >= weekStart);
    const weekEarnings = weekOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Trip count
    const tripCount = await prisma.trip.count({
      where: { riderId: parseInt(riderId), status: 1 } // 1 = Completed
    });

    return NextResponse.json({
      riderId: rider.id,
      riderName: rider.name,
      earnings: {
        total: totalEarnings,
        today: todayEarnings,
        thisWeek: weekEarnings,
        todayTrips: todayOrders.length,
        totalTrips: tripCount
      },
      recentOrders: completedOrders.slice(0, 10)
    });
  } catch (error) {
    console.error('Rider earnings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
