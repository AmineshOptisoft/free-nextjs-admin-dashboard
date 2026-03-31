import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const customerId = parseInt(params.id)

    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    const activeOrder = await prisma.order.findFirst({
      where: {
        customerId,
        status: { in: ['Pending', 'Accepted', 'Arrived', 'Started'] }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!activeOrder) {
      return NextResponse.json({ activeOrder: null })
    }

    return NextResponse.json({ activeOrder })
  } catch (error) {
    console.error('Active order fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
