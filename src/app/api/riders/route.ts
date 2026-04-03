import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/** Trim + remove spaces so "+91 98765 43210" and "+919876543210" match DB uniqueness intent */
function normalizePhone(phone: string) {
  return String(phone).trim().replace(/\s+/g, '')
}

export async function GET() {
  try {
    const riders = await prisma.rider.findMany({
      include: {
        _count: { select: { trips: true } },
      },
      orderBy: { createdAt: 'desc' }
    })

    // Attach assigned vehicle info manually to avoid stale Prisma TS types issue
    const riderIds = riders.map((r: any) => r.id)
    const riderDetails = await (prisma as any).rider.findMany({
      where: { id: { in: riderIds } },
      select: {
        id: true,
        assignedVehicleId: true,
        assignedVehicle: { select: { id: true, regNumber: true, model: true, battery: true } }
      }
    })
    const vehicleMap = new Map(riderDetails.map((r: any) => [r.id, r.assignedVehicle]))

    const ridersWithVehicle = riders.map((r: any) => ({
      ...r,
      assignedVehicle: vehicleMap.get(r.id) ?? null
    }))

    return NextResponse.json(ridersWithVehicle)
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

    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const existing = await prisma.rider.findUnique({
      where: { phone: normalizedPhone },
    })
    if (existing) {
      return NextResponse.json(
        {
          error:
            'This phone number is already registered. Use Login with the same number and password.',
          code: 'DUPLICATE_PHONE',
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const normalizedStatus =
      typeof status === 'number'
        ? status
        : status === 'suspended'
          ? 1
          : status === 'offline'
            ? 2
            : 0

    const rider = await prisma.rider.create({
      data: {
        name,
        phone: normalizedPhone,
        email: email || undefined,
        password: hashedPassword,
        nid: nid || undefined,
        status: normalizedStatus
      }
    })

    return NextResponse.json(rider, { status: 201 })
  } catch (error: any) {
    console.error('Create rider error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'Phone or email already exists. If this is your number, use Login instead of Register.',
          code: 'UNIQUE_VIOLATION',
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create rider' }, { status: 500 })
  }
}
