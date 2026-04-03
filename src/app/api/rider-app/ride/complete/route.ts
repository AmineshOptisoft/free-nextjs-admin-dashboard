import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/ride/complete:
 *   post:
 *     tags:
 *       - Rider Actions
 *     summary: Complete a ride
 *     description: End the trip, mark order as Delivered (4), update vehicle battery, calculate final fare, and free the vehicle.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, riderId, tripId]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               riderId:
 *                 type: integer
 *                 example: 1
 *               tripId:
 *                 type: integer
 *                 example: 1
 *               finalDistance:
 *                 type: number
 *                 description: Actual distance traveled in KM (optional, uses estimate if not provided)
 *                 example: 12.5
 *               batteryUsed:
 *                 type: integer
 *                 description: Battery percentage consumed during trip
 *                 example: 15
 *     responses:
 *       200:
 *         description: Ride completed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order or trip not found
 */
export async function POST(request: Request) {
  try {
    const { orderId, riderId, tripId, finalDistance, batteryUsed } = await request.json();

    if (!orderId || !riderId || !tripId) {
      return NextResponse.json({ error: 'orderId, riderId, and tripId are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.riderId !== parseInt(riderId)) {
      return NextResponse.json({ error: 'This order is not assigned to you' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: parseInt(tripId) } });
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // Calculate final fare if distance provided
    const distance = finalDistance || trip.distance || 0;
    const fare = Math.round(50 + 15 * distance); // base Rs.50 + Rs.15/km

    // Transaction: complete everything
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update order to Delivered
      const updatedOrder = await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: 4, amount: fare } // 4 = Delivered
      });

      // 2. Complete the trip
      const updatedTrip = await tx.trip.update({
        where: { id: parseInt(tripId) },
        data: {
          status: 1, // 1 = Completed
          endTime: new Date(),
          distance: parseFloat(String(distance)),
          fare
        }
      });

      // 3. Free the vehicle and reduce battery
      if (trip.vehicleId) {
        const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
        if (vehicle) {
          const newBattery = Math.max(0, vehicle.battery - (batteryUsed || 10));
          await tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 0, battery: newBattery } // 0 = Available
          });
        }
      }

      return { updatedOrder, updatedTrip };
    });

    return NextResponse.json({
      message: 'Ride completed successfully!',
      order: { id: result.updatedOrder.id, status: result.updatedOrder.status, amount: result.updatedOrder.amount },
      trip: { id: result.updatedTrip.id, distance: result.updatedTrip.distance, fare: result.updatedTrip.fare, endTime: result.updatedTrip.endTime }
    });
  } catch (error) {
    console.error('Complete ride error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
