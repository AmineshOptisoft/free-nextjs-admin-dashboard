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

    const customer = await prisma.customer.findUnique({ where: { id } })
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
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
    
    const { firstName, lastName, email, phone, street, city, state, zip, image } = body
    const data: any = {}
    
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (street !== undefined) data.street = street
    if (city !== undefined) data.city = city
    if (state !== undefined) data.state = state
    if (zip !== undefined) data.zip = zip
    if (image !== undefined) data.image = image

    const customer = await prisma.customer.update({ where: { id }, data })
    return NextResponse.json(customer)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
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

    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ message: 'Customer deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
