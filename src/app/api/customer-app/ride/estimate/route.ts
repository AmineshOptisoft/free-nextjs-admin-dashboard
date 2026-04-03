import { NextResponse } from 'next/server';

// Haversine formula to calculate distance in KM
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimated fare: base Rs.50 + Rs.15 per km
function calculateFare(distanceKm: number): number {
  return Math.round(50 + 15 * distanceKm);
}

/**
 * @swagger
 * /api/customer-app/ride/estimate:
 *   post:
 *     tags:
 *       - Customer Actions
 *     summary: Get fare estimate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupLat, pickupLng, dropLat, dropLng]
 *             properties:
 *               pickupLat:
 *                 type: number
 *               pickupLng:
 *                 type: number
 *               dropLat:
 *                 type: number
 *               dropLng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Success
 */
export async function POST(request: Request) {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = await request.json();
    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
    const fare = calculateFare(distance);

    return NextResponse.json({ estimatedDistance: parseFloat(distance.toFixed(2)), estimatedFare: fare });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
