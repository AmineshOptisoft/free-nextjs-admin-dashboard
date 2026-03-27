import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

    return NextResponse.json(vehicle)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const { regNumber, model, type, status, battery, image } = body

    const data: any = {}
    if (regNumber !== undefined) data.regNumber = regNumber
    if (model !== undefined) data.model = model
    if (type !== undefined) data.type = type
    if (status !== undefined) data.status = status
    if (battery !== undefined) data.battery = parseInt(battery)
    if (image !== undefined) data.image = image

    const vehicle = await prisma.vehicle.update({ where: { id }, data })
    return NextResponse.json(vehicle)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Registration number already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const tripsCount = await prisma.trip.count({ where: { vehicleId: id } })
    if (tripsCount > 0) {
      return NextResponse.json({ error: 'Cannot delete vehicle with associated trips' }, { status: 400 })
    }

    await prisma.vehicle.delete({ where: { id } })
    return NextResponse.json({ message: 'Vehicle deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
