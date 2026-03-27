import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const riders = await prisma.rider.findMany({
      include: {
        _count: {
          select: { trips: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(riders)
  } catch (error) {
    console.error('Fetch riders error:', error)
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password, nid, status } = body

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const rider = await prisma.rider.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        nid,
        status: status || 'active'
      }
    })

    return NextResponse.json(rider, { status: 201 })
  } catch (error: any) {
    console.error('Create rider error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Phone or email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create rider' }, { status: 500 })
  }
}
