const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root@localhost:3306/ev_fleet',
    },
  },
});

async function exportData() {
  try {
    const data = {
      admins: await prisma.admin.findMany(),
      riders: await prisma.rider.findMany(),
      vehicles: await prisma.vehicle.findMany(),
      trips: await prisma.trip.findMany(),
      customers: await prisma.customer.findMany(),
      locationLogs: await prisma.locationLog.findMany(),
      orders: await prisma.order.findMany(),
    };

    fs.writeFileSync('db_backup.json', JSON.stringify(data, null, 2));
    console.log('✅ Data exported successfully to db_backup.json');
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
