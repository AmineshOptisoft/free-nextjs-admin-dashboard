import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/rider-app/ride/arrive:
 *   post:
 *     tags:
 *       - Rider Actions
 *     summary: Notify customer that rider arrived
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, riderId]
 *             properties:
 *               orderId:
 *                 type: integer
 *               riderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Marked as Arrived
 */
import { ORDER_STATUS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { orderId, riderId } = await request.json();

    if (!orderId || !riderId) {
      return NextResponse.json({ error: 'orderId and riderId are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order || order.riderId !== parseInt(riderId)) {
      return NextResponse.json({ error: 'Invalid order or rider' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: ORDER_STATUS.ARRIVED } 
    });

    return NextResponse.json({ message: 'Rider marked as arrived', order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
