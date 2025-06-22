import { NextRequest, NextResponse } from 'next/server'
import { EventLogger } from '@/lib/services/event-logger'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Auth test endpoint is working',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { demo = false } = await request.json()
    
    if (!demo) {
      return NextResponse.json(
        { error: 'Demo mode required' },
        { status: 400 }
      )
    }

    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log demo access
    await EventLogger.logUserEvent(
      'demo_access',
      {
        demo_type: 'full_demo',
        access_method: 'api_call'
      },
      {
        ip_address: clientIP,
        user_agent: userAgent
      }
    )

    // Create demo user data
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@aedrin.com',
      name: 'Demo User',
      subscription: 'pro',
      demo: true
    }

    // Set demo cookies
    const response = NextResponse.json(
      { 
        success: true, 
        user: demoUser,
        demo: true,
        message: 'Demo mode activated'
      },
      { status: 200 }
    )

    // Set demo session cookies
    response.cookies.set('demo-session', 'demo-token-123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours for demo
    })

    return response

  } catch (error) {
    console.error('Demo route error:', error)
    
    // Log system error
    await EventLogger.logSystemEvent(
      'demo_system_error',
      {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      },
      'error',
      {
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 