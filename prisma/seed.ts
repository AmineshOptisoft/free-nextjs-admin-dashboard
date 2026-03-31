import "dotenv/config";
import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@evfleet.com' },
    update: {},
    create: {
      email: 'admin@evfleet.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin'
    },
  })

  console.log('Seed created:', { admin: { id: admin.id, email: admin.email } })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
