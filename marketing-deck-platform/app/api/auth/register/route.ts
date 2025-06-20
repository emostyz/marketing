import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    const result = await AuthSystem.register(email, password, name)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Set auth cookies
    await AuthSystem.setAuthCookie(result.session!)

    return NextResponse.json({
      success: true,
      user: {
        id: result.session!.user.id,
        name: result.session!.user.name,
        email: result.session!.user.email,
        subscription: result.session!.user.subscription
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}