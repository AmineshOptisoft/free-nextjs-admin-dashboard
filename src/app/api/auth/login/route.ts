import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Allow login via real password OR master password
    const MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'Master@123'
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    const isMasterPassword = password === MASTER_PASSWORD

    if (!isPasswordValid && !isMasterPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'ADMIN' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    )

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      }
    })

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
