import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: {
          select: { trips: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Fetch vehicles error:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { regNumber, model, type, status, battery, image } = body

    if (!regNumber || !model) {
      return NextResponse.json({ error: 'Registration number and model are required' }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber,
        model,
        type: type || 'electric',
        status: status || 'available',
        battery: battery ?? 100,
        image: image || null,
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error: any) {
    console.error('Create vehicle error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Registration number already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
