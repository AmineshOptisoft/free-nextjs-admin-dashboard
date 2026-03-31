import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any
    const { name, email, username } = await request.json()

    const updated = await prisma.admin.update({
      where: { id: decoded.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username }),
      },
      select: { id: true, name: true, email: true, username: true, createdAt: true }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Update profile error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email or username already taken' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
