import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/customer-app/ride/status/{id}:
 *   get:
 *     tags:
 *       - Customer Ride
 *     summary: Get real-time ride status
 *     description: Fetch the current status, rider info, and rider GPS location for a specific ride.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Order ID
 *     responses:
 *       200:
 *         description: Ride status fetched successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            lastLat: true,
            lastLng: true,
            rating: true,
            assignedVehicle: {
              select: { regNumber: true, model: true, type: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const statusLabels: Record<number, string> = {
      0: 'Pending', 1: 'Accepted', 2: 'Arrived',
      3: 'Started', 4: 'Delivered', 5: 'Canceled'
    };

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      statusLabel: statusLabels[order.status as number] || 'Unknown',
      pickupLoc: order.pickupLoc,
      dropLoc: order.dropLoc,
      amount: order.amount,
      paymentMode: order.paymentMode,
      otp: order.otp,
      rider: order.rider || null,
      customer: order.customer,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('Ride status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
