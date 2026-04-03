import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/customer-app/ride/cancel/{id}:
 *   post:
 *     tags:
 *       - Customer Ride
 *     summary: Cancel a ride request
 *     description: Customer cancels a ride before it is completed. Only Pending or Accepted rides can be canceled.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Order ID to cancel
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Ride canceled successfully
 *       400:
 *         description: Ride cannot be canceled at this stage
 *       404:
 *         description: Order not found
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Can only cancel Pending (0) or Accepted (1) rides
    const cancelableStatuses = [0, 1, 'Pending', 'Accepted'];
    if (!cancelableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'Ride cannot be canceled once it has started or been completed' },
        { status: 400 }
      );
    }

    // Must match /api/ride-requests/[id]/cancel: canceled orders use status 6.
    // (Status 5 is used by the admin complete flow for "Delivered".)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 6 },
    });

    // If a vehicle was in use, free it (ongoing trip: rider-app uses 0, admin flow uses 3)
    if (order.riderId) {
      const activeTrip = await prisma.trip.findFirst({
        where: { riderId: order.riderId, status: { in: [0, 3] } },
        orderBy: { startTime: 'desc' },
      });
      if (activeTrip) {
        await prisma.trip.update({
          where: { id: activeTrip.id },
          data: { status: 2, endTime: new Date() },
        });
        await prisma.vehicle.update({
          where: { id: activeTrip.vehicleId },
          data: { status: 0 },
        });
      }
    }

    return NextResponse.json({ message: 'Ride canceled successfully', order: updatedOrder });
  } catch (error) {
    console.error('Cancel ride error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
