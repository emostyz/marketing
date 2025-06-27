import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Verify credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables')
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      )
    }

    if (username !== adminUsername || password !== adminPassword) {
      // Log failed attempt for security
      console.warn(`Failed admin login attempt from IP: ${(request as any).ip || 'unknown'} at ${new Date().toISOString()}`)
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token for admin session
    const secret = process.env.NEXTAUTH_SECRET || 'default-secret'
    const token = sign(
      { 
        isAdmin: true, 
        username: adminUsername,
        loginTime: Date.now()
      },
      secret,
      { expiresIn: '8h' } // 8 hour session
    )

    // Log successful login
    console.log(`Successful admin login at ${new Date().toISOString()}`)

    const response = NextResponse.json({ 
      success: true, 
      token,
      message: 'Admin authentication successful'
    })

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/admin'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin logout - clear the cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })

    response.cookies.delete('admin_token')

    console.log(`Admin logout at ${new Date().toISOString()}`)

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}