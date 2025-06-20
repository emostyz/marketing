import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'

export async function POST(request: NextRequest) {
  try {
    const { email, password, demo = false } = await request.json()

    // Handle demo mode
    if (demo) {
      await AuthSystem.setDemoMode()
      return NextResponse.json({ 
        success: true, 
        user: {
          id: 1,
          name: 'Demo User',
          email: 'demo@aedrin.com',
          subscription: 'pro'
        },
        demo: true 
      })
    }

    // Regular authentication
    const result = await AuthSystem.authenticate(email, password)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}