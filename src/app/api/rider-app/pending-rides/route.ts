import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/rider-app/pending-rides?riderId=X
// Returns nearby pending ride orders for a rider
/**
 * @swagger
 * /api/rider-app/pending-rides:
 *   get:
 *     tags:
 *       - Rider Actions
 *     summary: Get pending rides near rider
 *     parameters:
 *       - in: query
 *         name: riderId
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the rider requesting pending rides
 *     responses:
 *       200:
 *         description: Successfully fetched pending rides
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const riderId = parseInt(searchParams.get('riderId') || '0')

    // Check if rider is already on a trip
    if (riderId) {
      const ongoingTrip = await prisma.trip.findFirst({
        where: { riderId, status: 3 },//'ongoing'
        include: {
          vehicle: true,
          locationLogs: { orderBy: { timestamp: 'desc' }, take: 1 }
        }
      })

      if (ongoingTrip) {
        // Rider is busy — return their current order
        const activeOrder = await prisma.order.findFirst({
          where: { riderId, status: { in: [1, 2] } },//'Accepted', 'Started'
          include: { customer: true },
          orderBy: { updatedAt: 'desc' }
        })
        return NextResponse.json({
          riderStatus: 'busy',
          currentTrip: ongoingTrip,
          activeOrder
        })
      }
    }

    // Rider is free — return all Pending orders
    const pendingOrders = await prisma.order.findMany({
      where: { status: 0 },//'Pending'
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      riderStatus: 'free',
      pendingOrders
    })
  } catch (error) {
    console.error('Error fetching pending rides:', error)
    return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 })
  }
}
