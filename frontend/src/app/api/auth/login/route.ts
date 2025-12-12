import { NextRequest, NextResponse } from 'next/server'

// Simple hardcoded credentials for demo
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create response with auth cookie
      const response = NextResponse.json({ success: true, message: 'Login successful' })
      
      // Set a simple auth cookie (in production, use proper JWT tokens)
      response.cookies.set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      
      return response
    }

    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}

