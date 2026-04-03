import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/location/sync:
 *   post:
 *     tags:
 *       - Rider Actions
 *     summary: Sync rider GPS location
 *     description: Periodic GPS coordinate update from the rider app. Updates rider's lastLat/lastLng and adds a LocationLog entry if rider is on an active trip.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [riderId, lat, lng]
 *             properties:
 *               riderId:
 *                 type: integer
 *                 example: 1
 *               lat:
 *                 type: number
 *                 example: 26.9124
 *               lng:
 *                 type: number
 *                 example: 75.7873
 *               area:
 *                 type: string
 *                 example: "Malviya Nagar, Jaipur"
 *     responses:
 *       200:
 *         description: Location synced
 *       400:
 *         description: Missing required fields
 */
export async function POST(request: Request) {
  try {
    const { riderId, lat, lng, area } = await request.json();

    if (!riderId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'riderId, lat, and lng are required' }, { status: 400 });
    }

    // Update rider's last known position
    await prisma.rider.update({
      where: { id: parseInt(riderId) },
      data: {
        lastLat: parseFloat(lat),
        lastLng: parseFloat(lng),
        lastArea: area || null,
        lastUpdated: new Date()
      }
    });

    // If rider has an active trip, log coordinates
    const activeTrip = await prisma.trip.findFirst({
      where: { riderId: parseInt(riderId), status: 0 } // 0 = Ongoing
    });

    if (activeTrip) {
      await prisma.locationLog.create({
        data: {
          tripId: activeTrip.id,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          timestamp: new Date()
        }
      });
    }

    return NextResponse.json({ message: 'Location synced', activeTrip: activeTrip ? activeTrip.id : null });
  } catch (error) {
    console.error('Location sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
