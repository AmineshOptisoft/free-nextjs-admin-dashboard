const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restore() {
  try {
    const rawData = JSON.parse(fs.readFileSync('raw_db_backup.json', 'utf8'));

    // Status Mappers
    const mapOrderStatus = (s) => ({ 'Pending':0, 'Accepted':1, 'Arrived':2, 'Started':3, 'Delivered':4, 'Canceled':5 }[s] ?? 0);
    const mapRiderStatus = (s) => ({ 'active':0, 'suspended':1, 'offline':2 }[s?.toLowerCase()] ?? 0);
    const mapVehicleStatus = (s) => ({ 'available':0, 'in_use':1, 'maintenance':2 }[s?.toLowerCase()] ?? 0);
    const mapTripStatus = (s) => ({ 'ongoing':0, 'completed':1, 'cancelled':2 }[s?.toLowerCase()] ?? 0);

    const defaultCustomerPassword = await bcrypt.hash('password123', 10);

    // Turn off foreign key checks temporarily if we were using raw SQL, but Prisma create queries respect them.
    // We will insert in order: Admins, Vehicles, Riders, Customers, Trips, Orders, LocationLogs

    if (rawData.admins && rawData.admins.length > 0) {
      await prisma.admin.createMany({ data: rawData.admins, skipDuplicates: true });
      console.log('Admins restored');
    }

    if (rawData.vehicles && rawData.vehicles.length > 0) {
      const vehicles = rawData.vehicles.map(v => ({
        ...v,
        status: mapVehicleStatus(v.status)
      }));
      await prisma.vehicle.createMany({ data: vehicles, skipDuplicates: true });
      console.log('Vehicles restored');
    }

    if (rawData.riders && rawData.riders.length > 0) {
      const riders = rawData.riders.map(r => ({
        ...r,
        status: mapRiderStatus(r.status)
      }));
      await prisma.rider.createMany({ data: riders, skipDuplicates: true });
      console.log('Riders restored');
    }

    if (rawData.customers && rawData.customers.length > 0) {
      const customers = rawData.customers.map(c => ({
        ...c,
        password: c.password || defaultCustomerPassword
      }));
      await prisma.customer.createMany({ data: customers, skipDuplicates: true });
      console.log('Customers restored');
    }

    if (rawData.trips && rawData.trips.length > 0) {
      const trips = rawData.trips.map(t => ({
        ...t,
        status: mapTripStatus(t.status)
      }));
      await prisma.trip.createMany({ data: trips, skipDuplicates: true });
      console.log('Trips restored');
    }

    if (rawData.orders && rawData.orders.length > 0) {
      const orders = rawData.orders.map(o => ({
        ...o,
        status: mapOrderStatus(o.status)
      }));
      await prisma.order.createMany({ data: orders, skipDuplicates: true });
      console.log('Orders restored');
    }

    console.log('✅ ALL DATA RESTORED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Restore error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
