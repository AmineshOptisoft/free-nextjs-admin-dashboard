import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function orderStatusLabel(status: number) {
  switch (status) {
    case 0:
      return 'Pending'
    case 1:
      return 'Accepted'
    case 2:
      return 'Arrived'
    case 3:
    case 4:
      return 'Started'
    case 5:
      return 'Delivered'
    case 6:
      return 'Cancelled'
    default:
      return String(status)
  }
}

// GET /api/ride-requests/[id]
// Fetches detailed information about a specific ride request for tracking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const orderId = parseInt(rawId)
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...order,
      statusCode: order.status,
      status: orderStatusLabel(order.status),
    })

  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
