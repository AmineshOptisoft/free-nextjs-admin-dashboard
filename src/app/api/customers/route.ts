import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Fetch customers error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, street, city, state, zip, image, password } = body

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const hashedPassword =
      password && String(password).length >= 6
        ? await bcrypt.hash(String(password), 10)
        : undefined

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone: String(phone).trim().replace(/\s+/g, ''),
        street,
        city,
        state,
        zip,
        image,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Create customer error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
