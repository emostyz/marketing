import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import { EventLogger } from '@/lib/services/event-logger'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      
      // Log failed login attempt
      await EventLogger.logAuthEvent(
        'anonymous',
        'login_failed',
        {
          email,
          error_message: error.message,
          error_code: error.status || 'unknown'
        },
        {
          ip_address: clientIP,
          user_agent: userAgent
        }
      )

      // Provide specific error messages
      let errorMessage = 'Invalid email or password'
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in. If you haven\'t received the confirmation email, please check your spam folder or contact support.'
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get or create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
    }

    // Create profile if it doesn't exist
    if (!profile) {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          first_name: data.user.user_metadata?.name?.split(' ')[0] || data.user.email?.split('@')[0] || 'User',
          last_name: data.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (createProfileError) {
        console.error('Profile creation error:', createProfileError)
      }
    }

    // Log successful login
    await EventLogger.logAuthEvent(
      data.user.id,
      'login_successful',
      {
        email,
        user_id: data.user.id,
        login_method: 'email_password'
      },
      {
        ip_address: clientIP,
        user_agent: userAgent,
        session_id: data.session?.access_token || undefined
      }
    )

    // Set cookies for the session
    const response = NextResponse.json(
      { 
        success: true, 
        user: data.user,
        session: data.session 
      },
      { status: 200 }
    )

    // Set auth cookies
    if (data.session) {
      response.cookies.set('sb-waddrfstpqkvdfwbxvfw-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
      
      response.cookies.set('sb-waddrfstpqkvdfwbxvfw-auth-token.0', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
    }

    return response

  } catch (error) {
    console.error('Login route error:', error)
    
    // Log system error
    await EventLogger.logSystemEvent(
      'login_system_error',
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