import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { publishNotification } from "@/lib/redis-pub";
import { sendPushNotification } from "@/lib/onesignal-server";
import { ORDER_STATUS, RIDER_STATUS, TRIP_STATUS } from "@/lib/constants";

// Generate a 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Haversine formula to calculate distance in KM between two lat/lng coords
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimated fare: base Rs.50 + Rs.15 per km
function calculateFare(distanceKm: number): number {
  return Math.round(50 + 15 * distanceKm);
}

/**
 * @swagger
 * /api/book-ride:
 *   post:
 *     tags:
 *       - Ride Booking
 *     summary: Request a new ride
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, phone, pickupLat, pickupLng, dropLat, dropLng]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               pickupLat:
 *                 type: number
 *               pickupLng:
 *                 type: number
 *               pickupLoc:
 *                 type: string
 *               dropLat:
 *                 type: number
 *               dropLng:
 *                 type: number
 *               dropLoc:
 *                 type: string
 *               paymentMode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ride request placed successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Active ride already in progress
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      // Pickup
      pickupLat,
      pickupLng,
      pickupLoc,
      // Drop
      dropLat,
      dropLng,
      dropLoc,
      // Save prefs
      saveAsHome,
      saveAsWork,
      // Payment preference
      paymentMode = "Cash",
    } = data;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone number are required." },
        { status: 400 }
      );
    }

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return NextResponse.json(
        { error: "Pickup and drop coordinates are required." },
        { status: 400 }
      );
    }

    // 1. Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer && email) {
      customer = await prisma.customer.findUnique({
        where: { email },
      });
    }

    const customerData: any = { firstName, lastName };
    
    // Explicit save requests
    if (saveAsHome && pickupLoc) customerData.homeAddress = pickupLoc;
    if (saveAsWork && pickupLoc) customerData.workAddress = pickupLoc;

    if (!customer) {
      const resolvedEmail = email || `user_${phone}@kadi.app`;
      // AUTO-SAVE: If this is their first time, save pickup as default address (street)
      customerData.street = pickupLoc; 
      customer = await prisma.customer.create({
        data: { ...customerData, phone, email: resolvedEmail },
      });
    } else {
      // AUTO-SAVE: If they have NO address saved anywhere, fill the 'street' field at minimum
      if (!customer.street && !customer.homeAddress && !customer.workAddress && pickupLoc) {
        customerData.street = pickupLoc;
      }
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: customerData,
      });
    }

    // ── Check for active ride ─────────────────────────────────────────────
    const activeOrder = await prisma.order.findFirst({
      where: {
        customerId: customer.id,
        // Active means still in-progress. Exclude Delivered (4) and Canceled (5).
        status: { in: [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED, ORDER_STATUS.ARRIVED, ORDER_STATUS.STARTED] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (activeOrder) {
      return NextResponse.json(
        {
          error: 'active_ride',
          message: 'You already have an active ride in progress. Please wait for it to complete.',
          activeOrder: {
            id: activeOrder.id,
            status: activeOrder.status,
            pickupLoc: activeOrder.pickupLoc,
            dropLoc: activeOrder.dropLoc,
          }
        },
        { status: 409 }
      );
    }

    // 2. Calculate estimated distance & fare
    const distanceKm = calculateDistance(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(dropLat),
      parseFloat(dropLng)
    );
    const estimatedFare = calculateFare(distanceKm);

    // 3. Generate OTP for ride verification when rider arrives
    const otp = generateOTP();

    // 4. Create the Order (Ride Request)
    const newOrder = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: ORDER_STATUS.PENDING,
        date: new Date(),
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        pickupLoc: pickupLoc || null,
        dropLat: parseFloat(dropLat),
        dropLng: parseFloat(dropLng),
        dropLoc: dropLoc || null,
        otp,
        paymentMode,
        amount: estimatedFare,
      },
      include: { customer: true },
    });

    // ── NEW: Real-time notification to Admin ───────────────────────────
    await publishNotification('new-booking', {
      orderId: newOrder.id,
      customerName: `${newOrder.customer.firstName} ${newOrder.customer.lastName}`,
      pickup: newOrder.pickupLoc,
      amount: newOrder.amount,
      message: `🔔 New Ride Request: #ORD-${newOrder.id} from ${newOrder.customer.firstName}`
    });

    // Optional: Send Push Notification (to Admins/All Devices)
    // Runs in the background (no await needed for response delay)
    sendPushNotification({
      title: "New Ride Request 🚖",
      message: `${newOrder.customer.firstName} is looking for a ride from ${newOrder.pickupLoc}.`,
      url: `/admin/tracking`
    });

    // 5. Find nearby free riders (using Haversine on their latest location logs)
    const freeRiders = await prisma.rider.findMany({
      where: {
        status: RIDER_STATUS.ACTIVE,
        trips: {
          none: { status: TRIP_STATUS.ONGOING },
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        trips: {
          where: { status: 4 },//"completed"
          orderBy: { endTime: "desc" },
          take: 1,
          include: {
            locationLogs: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    // 6. Filter and sort riders by distance to pickup point
    const nearbyRiders = freeRiders
      .map((rider) => {
        const lastLog = rider.trips[0]?.locationLogs[0];
        if (!lastLog) return { ...rider, distance: Infinity };
        const dist = calculateDistance(
          lastLog.lat,
          lastLog.lng,
          parseFloat(pickupLat),
          parseFloat(pickupLng)
        );
        return { ...rider, distance: parseFloat(dist.toFixed(2)) };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 nearest riders

    return NextResponse.json(
      {
        message: "Ride request placed successfully!",
        order: {
          id: newOrder.id,
          status: newOrder.status,
          otp: newOrder.otp, // Customer should save this OTP
          amount: newOrder.amount,
          distance: parseFloat(distanceKm.toFixed(2)),
          paymentMode: newOrder.paymentMode,
          pickupLoc: newOrder.pickupLoc,
          dropLoc: newOrder.dropLoc,
          customer: {
            name: `${newOrder.customer.firstName} ${newOrder.customer.lastName}`,
            phone: newOrder.customer.phone,
          },
        },
        nearbyRiders, // Admin can use this to manually assign
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating ride request:", error);
    return NextResponse.json(
      { error: "Failed to place ride request. Please try again." },
      { status: 500 }
    );
  }
}
