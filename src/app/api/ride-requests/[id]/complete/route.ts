import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { publishNotification } from '@/lib/redis-pub'
import { sendPushNotification } from '@/lib/onesignal-server'

// POST /api/ride-requests/[id]/complete
// Rider marks the ride as complete after dropping customer. Payment is then collected.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const orderId = parseInt(rawId)
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 })

    const body = await request.json()
    const {
      paymentMode,  // rider updates: Cash, UPI, Card, etc. (may change from default)
      distanceTravelled, // actual KMs covered
    } = body

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { rider: true, customer: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 4) {//'Started'
      return NextResponse.json({ error: 'Only "Started" rides can be completed' }, { status: 400 })
    }

    if (!order.riderId) {
      return NextResponse.json({ error: 'No rider assigned to this order' }, { status: 400 })
    }

    // Find the ongoing trip for this rider
    const currentTrip = await prisma.trip.findFirst({
      where: {
        riderId: order.riderId,
        status: 3//'ongoing'
      },
      orderBy: { startTime: 'desc' }
    })

    if (!currentTrip) {
      return NextResponse.json({ error: 'No ongoing trip found for the assigned rider' }, { status: 404 })
    }

    // Calculate the final fare based on actual distance
    const actualDistance = distanceTravelled ? parseFloat(distanceTravelled) : currentTrip.distance || 0;
    const finalFare = order.amount ?? Math.round(50 + 15 * actualDistance)

    // Complete everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark order as Delivered
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 5,//'Delivered',
          paymentMode: paymentMode || order.paymentMode || 'Cash',
          amount: finalFare,
        }
      })

      // 2. Complete the Trip 
      const updatedTrip = await tx.trip.update({
        where: { id: currentTrip.id },
        data: {
          status: 6,//'completed',
          endTime: new Date(),
          distance: actualDistance,
          fare: finalFare,
        }
      })

      // 3. Free the vehicle back to available
      await tx.vehicle.update({
        where: { id: currentTrip.vehicleId },
        data: { status: 1 }//'available'
      })

      return { order: updatedOrder, trip: updatedTrip }
    })

    // 4. Send real-time notification to Admin and Customer
    await publishNotification('trip-completed', {
      orderId,
      riderId: order.riderId!,
      amount: finalFare,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      message: `🏁 Trip completed: Ride #ORD-${orderId} finished. ₹${finalFare} collected.`
    });

    sendPushNotification({
      title: "Ride Completed ✅",
      message: `Your ride is complete! Thanks for riding with Kadi. Total Fare: ₹${finalFare}`,
      url: `/user/orders`,
      userIds: [order.customerId.toString()]
    });

    return NextResponse.json({
      message: `Ride #${orderId} completed! Payment of ₹${finalFare} via ${paymentMode || order.paymentMode || 'Cash'}.`,
      data: {
        orderId: result.order.id,
        tripId: result.trip.id,
        status: result.order.status,
        amountCollected: finalFare,
        paymentMode: result.order.paymentMode,
        distanceTravelled: actualDistance,
        rider: order.rider?.name,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Ride completion error:', error)
    return NextResponse.json({ error: 'Failed to complete ride' }, { status: 500 })
  }
}
