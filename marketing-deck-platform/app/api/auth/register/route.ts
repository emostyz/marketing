import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, company } = await request.json()

    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // Validate input
    if (!name || !email || !password) {
      // Log validation failure
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.from('user_events').insert({
        event_type: 'registration_validation_failed',
        event_data: {
          email: email || null,
          name: name || null,
          company: company || null,
          missing_fields: {
            name: !name,
            email: !email,
            password: !password
          }
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      // Log password validation failure
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.from('user_events').insert({
        event_type: 'registration_password_validation_failed',
        event_data: {
          email,
          name,
          company: company || null,
          password_length: password.length
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Log registration attempt
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('user_events').insert({
      event_type: 'registration_attempted',
      event_data: {
        email,
        name,
        company: company || null,
        has_password: !!password
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer
    })

    // Register user
    const result = await AuthSystem.register(email, password, name)
    
    if (!result.success) {
      // Log registration failure
      await supabase.from('user_events').insert({
        event_type: 'registration_failed',
        event_data: {
          email,
          name,
          company: company || null,
          error: result.error
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Log successful registration
    await supabase.from('user_events').insert({
      event_type: 'registration_successful',
      event_data: {
        user_id: result.session!.user.id,
        email,
        name,
        company: company || null
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      user_id: result.session!.user.id
    })

    // Log auth event
    await supabase.from('auth_events').insert({
      user_id: result.session!.user.id,
      event_type: 'registered',
      event_data: {
        method: 'email',
        email,
        name,
        company: company || null
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
    console.error('Registration error:', error)
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('system_events').insert({
      event_type: 'registration_system_error',
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