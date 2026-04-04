import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

import { RIDER_STATUS, VEHICLE_STATUS } from '@/lib/constants'

// GET /api/riders/live-status
export async function GET() {
  try {
    const riders = await prisma.rider.findMany({
      where: { status: RIDER_STATUS.ACTIVE },
      select: {
        id: true,
        name: true,
        phone: true,
        lastLat: true,
        lastLng: true,
        lastArea: true,
        lastUpdated: true,
        assignedVehicleId: true,
        assignedVehicle: {
          select: {
            id: true,
            regNumber: true,
            model: true,
            battery: true,
            status: true
          }
        }
      }
    })

    // Map to a cleaner format
    const formatted = riders.map(r => ({
      riderId: r.id,
      name: r.name,
      lat: r.lastLat || 28.6139,
      lng: r.lastLng || 77.2090,
      area: r.lastArea || "Unknown",
      lastSeen: r.lastUpdated ? r.lastUpdated.getTime() : Date.now(),
      status: r.assignedVehicle?.status === VEHICLE_STATUS.IN_USE ? 'busy' : 'free',
      assignedVehicleId: r.assignedVehicleId ?? null,
      assignedVehicle: r.assignedVehicle ?? null,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Fetch live status error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
