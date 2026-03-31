import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// These are the admin routes that need protection
const protectedRoutes = [
  '/admin',
  '/customers',
  '/ebikes',
  '/orders',
  '/reports',
  '/riders',
  '/tracking',
  '/profile'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an admin protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      // No token found, redirect to admin login
      const url = request.nextUrl.clone()
      url.pathname = '/adminlogin'
      return NextResponse.redirect(url)
    }
  }

  // Allow the request to proceed if valid or unrestricted
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
