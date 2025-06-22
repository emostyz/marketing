import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, demo = false } = await request.json()

    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // Handle demo mode
    if (demo) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Log demo login
      await supabase.from('user_events').insert({
        event_type: 'demo_login',
        event_data: {
          email: 'demo@aedrin.com',
          name: 'Demo User'
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

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

    // Log login attempt
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('user_events').insert({
      event_type: 'login_attempted',
      event_data: {
        email,
        has_password: !!password
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer
    })

    // Regular authentication
    const result = await AuthSystem.authenticate(email, password)
    
    if (!result.success) {
      // Log failed login
      await supabase.from('user_events').insert({
        event_type: 'login_failed',
        event_data: {
          email,
          error: result.error
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Log successful login
    await supabase.from('user_events').insert({
      event_type: 'login_successful',
      event_data: {
        user_id: result.session!.user.id,
        email,
        name: result.session!.user.name,
        subscription: result.session!.user.subscription
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      user_id: result.session!.user.id
    })

    // Log auth event
    await supabase.from('auth_events').insert({
      user_id: result.session!.user.id,
      event_type: 'logged_in',
      event_data: {
        method: 'email',
        email,
        name: result.session!.user.name
      },
      ip_address: clientIP,
      user_agent: userAgent,
      session_id: result.session!.token,
      created_at: new Date().toISOString()
    })

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
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('system_events').insert({
      event_type: 'login_system_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      severity: 'critical'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}