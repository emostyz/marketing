import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // Try to get current user before logout
    let currentUser = null
    try {
      currentUser = await AuthSystem.getCurrentUser()
    } catch (error) {
      // User might not be authenticated, continue with logout
    }

    // Log logout event if user was authenticated
    if (currentUser) {
      const supabase = createRouteHandlerClient({ cookies })
      
      await supabase.from('user_events').insert({
        event_type: 'logout',
        event_data: {
          user_id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        user_id: currentUser.id
      })

      await supabase.from('auth_events').insert({
        user_id: currentUser.id,
        event_type: 'logged_out',
        event_data: {
          method: 'manual',
          email: currentUser.email,
          name: currentUser.name
        },
        ip_address: clientIP,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
    }

    // Clear all auth cookies
    await AuthSystem.clearAuthCookies()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('system_events').insert({
      event_type: 'logout_system_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      severity: 'error'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}