import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @swagger
 * /api/customer-app/history:
 *   get:
 *     tags:
 *       - Customer Ride
 *     summary: Get ride history
 *     description: List all past rides for the authenticated customer with dates, fares, and pickup/drop info.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Ride history fetched successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId || decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: decoded.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          rider: {
            select: { id: true, name: true, phone: true, rating: true }
          }
        }
      }),
      prisma.order.count({ where: { customerId: decoded.userId } })
    ]);

    const statusLabels: Record<number, string> = {
      0: 'Pending', 1: 'Accepted', 2: 'Arrived',
      3: 'Started', 4: 'Delivered', 5: 'Canceled'
    };

    return NextResponse.json({
      rides: orders.map(o => ({
        id: o.id,
        status: o.status,
        statusLabel: statusLabels[o.status as number] || 'Unknown',
        pickupLoc: o.pickupLoc,
        dropLoc: o.dropLoc,
        amount: o.amount,
        paymentMode: o.paymentMode,
        date: o.date,
        rider: o.rider,
        createdAt: o.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Customer history error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
