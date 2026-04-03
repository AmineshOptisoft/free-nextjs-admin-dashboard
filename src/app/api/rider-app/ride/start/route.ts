import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/ride/start:
 *   post:
 *     tags:
 *       - Rider Actions
 *     summary: Start the ride (OTP verification)
 *     description: Rider verifies the customer OTP and starts the trip. Order status changes to Started (3) and a Trip record is created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, riderId, vehicleId, otp]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               riderId:
 *                 type: integer
 *                 example: 1
 *               vehicleId:
 *                 type: integer
 *                 example: 1
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Ride started successfully
 *       400:
 *         description: Invalid OTP or validation error
 *       404:
 *         description: Order not found
 */
export async function POST(request: Request) {
  try {
    const { orderId, riderId, vehicleId, otp } = await request.json();

    if (!orderId || !riderId || !vehicleId || !otp) {
      return NextResponse.json({ error: 'orderId, riderId, vehicleId, and otp are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { customer: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.riderId !== parseInt(riderId)) {
      return NextResponse.json({ error: 'This order is not assigned to you' }, { status: 400 });
    }

    // Verify OTP
    if (order.otp !== String(otp)) {
      return NextResponse.json({ error: 'Invalid OTP. Please ask the customer for the correct code.' }, { status: 400 });
    }

    // Only Arrived (2) orders can be started
    const arrivedStatuses = [2, 'Arrived'];
    if (!arrivedStatuses.includes(order.status)) {
      return NextResponse.json({ error: 'Rider must arrive at pickup first before starting the ride' }, { status: 400 });
    }

    // Transaction: update order + create trip
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: 3 } // 3 = Started
      });

      const trip = await tx.trip.create({
        data: {
          riderId: parseInt(riderId),
          vehicleId: parseInt(vehicleId),
          startTime: new Date(),
          status: 0, // 0 = Ongoing
          startLoc: order.pickupLoc || null,
          endLoc: order.dropLoc || null
        }
      });

      return { updatedOrder, trip };
    });

    return NextResponse.json({
      message: 'Ride started! Navigate to the drop location.',
      order: { id: result.updatedOrder.id, status: result.updatedOrder.status },
      trip: { id: result.trip.id, startTime: result.trip.startTime }
    });
  } catch (error) {
    console.error('Start ride error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
