import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/customer-app/ride/rate:
 *   post:
 *     tags:
 *       - Customer Ride
 *     summary: Rate a completed ride
 *     description: Submit rating (1-5) and optional feedback for a completed ride.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, rating]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               feedback:
 *                 type: string
 *                 example: "Great ride, very smooth!"
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Validation error or ride not completed
 *       404:
 *         description: Order not found
 */
export async function POST(request: Request) {
  try {
    const { orderId, rating, feedback } = await request.json();

    if (!orderId || !rating) {
      return NextResponse.json({ error: 'orderId and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only completed/delivered rides can be rated
    const completedStatuses = [4, 'Delivered', 'Completed'];
    if (!completedStatuses.includes(order.status)) {
      return NextResponse.json({ error: 'Only completed rides can be rated' }, { status: 400 });
    }

    if (!order.riderId) {
      return NextResponse.json({ error: 'No rider assigned to this order' }, { status: 400 });
    }

    // Update rider rating (running average)
    const rider = await prisma.rider.findUnique({ where: { id: order.riderId } });
    if (rider) {
      const currentRating = rider.rating || 0;
      // Simple running average
      const completedOrderCount = await prisma.order.count({
        where: { riderId: rider.id, status: { in: [4] } }
      });
      const newRating = completedOrderCount > 0
        ? ((currentRating * (completedOrderCount - 1)) + rating) / completedOrderCount
        : rating;

      await prisma.rider.update({
        where: { id: rider.id },
        data: { rating: parseFloat(newRating.toFixed(2)) }
      });
    }

    return NextResponse.json({
      message: 'Rating submitted successfully',
      orderId: order.id,
      rating,
      feedback: feedback || null
    });
  } catch (error) {
    console.error('Rate ride error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
