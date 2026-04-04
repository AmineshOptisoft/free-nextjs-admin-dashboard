import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { publishNotification } from '@/lib/redis-pub'
import { sendPushNotification } from '@/lib/onesignal-server'
import { ORDER_STATUS, TRIP_STATUS, VEHICLE_STATUS } from '@/lib/constants'

// POST /api/ride-requests/[id]/cancel
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const orderId = parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, riderId: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Terminal: 5 = Delivered (admin /ride-requests/complete), 6 = Cancelled (this route + customer-app cancel)
    if (order.status === ORDER_STATUS.DELIVERED) {
      return NextResponse.json(
        {
          error:
            'This ride has already been completed (delivered) and cannot be cancelled.',
          orderStatus: order.status,
        },
        { status: 400 }
      );
    }

    if (order.status === ORDER_STATUS.CANCELED) {
      return NextResponse.json({
        success: true,
        status: 'Cancelled',
        alreadyCancelled: true,
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.CANCELED },
    });

    // If a rider was assigned, their trip needs to be cancelled and their status freed
    if (order.riderId) {
      // Find ongoing trip for this rider
      const trip = await prisma.trip.findFirst({
        where: { riderId: order.riderId, status: TRIP_STATUS.ONGOING }
      });
      if (trip) {
        await prisma.trip.update({
          where: { id: trip.id },
          data: { status: TRIP_STATUS.CANCELLED, endTime: new Date() }
        });

        // Free up the vehicle
        await prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VEHICLE_STATUS.AVAILABLE }
        });
      }

      // Notify Rider
      await publishNotification('notification', {
        orderId,
        riderId: order.riderId,
        type: 'cancelled',
        message: `Order #ORD-${orderId} was cancelled by the user.`
      });
    }

    // Notify Admin via WebSocket
    await publishNotification('notification', {
      orderId: updatedOrder.id,
      type: 'cancelled',
      message: `User cancelled request #ORD-${updatedOrder.id}`
    });

    sendPushNotification({
      title: "Ride Cancelled 🚫",
      message: `Order #ORD-${orderId} was cancelled by the customer.`,
    });

    return NextResponse.json({ success: true, status: 'Cancelled' })
  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
