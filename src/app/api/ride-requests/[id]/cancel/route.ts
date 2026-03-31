import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { publishNotification } from '@/lib/redis-pub'
import { sendPushNotification } from '@/lib/onesignal-server'

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
      include: { customer: true, rider: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only allow cancellation if not completed
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return NextResponse.json({ error: 'Order cannot be cancelled in its current state.' }, { status: 400 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Cancelled' }
    })

    // If a rider was assigned, their trip needs to be cancelled and their status freed
    if (order.riderId) {
       // Find ongoing trip for this rider
       const trip = await prisma.trip.findFirst({
         where: { riderId: order.riderId, status: 'ongoing' }
       });
       if (trip) {
         await prisma.trip.update({
           where: { id: trip.id },
           data: { status: 'cancelled', endTime: new Date() }
         });

         // Free up the vehicle
         await prisma.vehicle.update({
           where: { id: trip.vehicleId },
           data: { status: 'available' }
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
