import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/status:
 *   patch:
 *     tags:
 *       - Rider Actions
 *     summary: Update rider availability status
 *     description: Toggle rider between Online (0 = Active) and Offline (2). Used when rider opens/closes the app.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [riderId, status]
 *             properties:
 *               riderId:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: integer
 *                 enum: [0, 2]
 *                 description: "0 = Active/Online, 2 = Offline"
 *                 example: 0
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Rider not found
 */
import { RIDER_STATUS } from '@/lib/constants';

export async function PATCH(request: Request) {
  try {
    const { riderId, status } = await request.json();

    if (!riderId || status === undefined) {
      return NextResponse.json({ error: 'riderId and status are required' }, { status: 400 });
    }

    if (![RIDER_STATUS.ACTIVE, RIDER_STATUS.OFFLINE].includes(status)) {
      return NextResponse.json({ error: 'Status must be 0 (Online) or 2 (Offline)' }, { status: 400 });
    }

    const rider = await prisma.rider.findUnique({ where: { id: parseInt(riderId) } });
    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    if (rider.status === RIDER_STATUS.SUSPENDED) {
      return NextResponse.json({ error: 'Your account is suspended. Contact admin.' }, { status: 403 });
    }

    const updatedRider = await prisma.rider.update({
      where: { id: parseInt(riderId) },
      data: { status, lastUpdated: new Date() }
    });

    const statusLabel = status === RIDER_STATUS.ACTIVE ? 'Online' : 'Offline';
    return NextResponse.json({
      message: `Rider is now ${statusLabel}`,
      rider: { id: updatedRider.id, name: updatedRider.name, status: updatedRider.status }
    });
  } catch (error) {
    console.error('Rider status update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
