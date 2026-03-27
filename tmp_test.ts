import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function test() {
  try {
    await prisma.$connect()
    console.log('Connected!')
  } catch (e) {
    console.error('FULL ERROR:', e)
  } finally {
    await prisma.$disconnect()
  }
}
test()
