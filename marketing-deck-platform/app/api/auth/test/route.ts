import { NextRequest, NextResponse } from 'next/server'

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
    // Handle empty request body
    let body = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (parseError) {
      // If JSON parsing fails, use empty object
      body = {}
    }
    
    const { demo = false, clear = false } = body as { demo?: boolean, clear?: boolean }
    
    if (clear) {
      // Clear demo cookies
      const response = NextResponse.json({ 
        success: true, 
        message: 'Demo session cleared'
      })
      
      response.cookies.set('demo-session', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0), // Set to epoch time to expire immediately
        path: '/'
      })
      
      response.cookies.set('sb-demo-auth-token', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0), // Set to epoch time to expire immediately
        path: '/'
      })
      
      return response
    }
    
    if (!demo) {
      return NextResponse.json(
        { error: 'Demo mode required' },
        { status: 400 }
      )
    }
    
    // Create response with demo data
    const response = NextResponse.json({ 
      success: true, 
      message: 'Demo mode activated',
      demo: {
        active: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        features: ['unlimited_presentations', 'ai_insights', 'templates']
      }
    })
    
    // Set demo session cookies (non-HttpOnly for better browser compatibility)
    response.cookies.set('demo-session', 'active', {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })
    
    // Also set a Supabase-like cookie for compatibility
    response.cookies.set('sb-demo-auth-token', 'demo-token', {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Demo route error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 