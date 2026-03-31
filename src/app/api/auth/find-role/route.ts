import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // 1. Check Rider
    const rider = await prisma.rider.findUnique({
      where: { phone }
    })

    if (rider) {
      return NextResponse.json({ role: 'rider', found: true, data: rider })
    }

    // 2. Check Customer
    const customer = await prisma.customer.findUnique({
      where: { phone }
    })

    if (customer) {
      return NextResponse.json({ role: 'customer', found: true, data: customer })
    }

    // Not found
    return NextResponse.json({ found: false })

  } catch (error) {
    console.error('Find role by phone error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
