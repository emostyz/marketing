import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import { EventLogger } from '@/lib/services/event-logger'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    })

    if (error) {
      console.error('Registration error:', error)
      
      // Log failed registration
      await EventLogger.logAuthEvent(
        'anonymous',
        'registration_failed',
        {
          email,
          name,
          error_message: error.message,
          error_code: error.status || 'unknown'
        },
        {
          ip_address: clientIP,
          user_agent: userAgent
        }
      )

      // Provide specific error messages
      let errorMessage = error.message
      
      if (error.message.includes('Email address is invalid')) {
        errorMessage = 'Please enter a valid email address'
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many registration attempts. Please wait a few minutes before trying again.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    // Create user profile with correct column names and user_id
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        full_name: name,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Log profile creation error
      await EventLogger.logSystemEvent(
        'profile_creation_error',
        {
          user_id: data.user.id,
          error_message: profileError.message,
          error_code: profileError.code || 'unknown'
        },
        'error',
        {
          ip_address: clientIP,
          user_agent: userAgent
        }
      )
    }

    // Log successful registration
    await EventLogger.logAuthEvent(
      data.user.id,
      'registration_successful',
      {
        email,
        name,
        user_id: data.user.id
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
        session: data.session,
        message: data.user.email_confirmed_at 
          ? 'Account created successfully' 
          : 'Account created successfully! Please check your email to confirm your account before signing in.'
      },
      { status: 201 }
    )

    // Set auth cookies if session exists
    if (data.session) {
      response.cookies.set('sb-waddrfstpqkvdfwbxvfw-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      response.cookies.set('sb-waddrfstpqkvdfwbxvfw-auth-token.0', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('Registration route error:', error)
    
    // Log system error
    await EventLogger.logSystemEvent(
      'registration_system_error',
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