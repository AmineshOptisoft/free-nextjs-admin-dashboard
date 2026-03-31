import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { phone }
    })

    if (customer) {
      return NextResponse.json({ found: true, customer })
    } else {
      return NextResponse.json({ found: false })
    }

  } catch (error) {
    console.error('Find customer by phone error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
