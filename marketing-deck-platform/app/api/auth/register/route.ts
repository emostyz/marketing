import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

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

    const supabase = await createServerSupabaseClient()
    
    // Sign up the user with auto-confirm for development
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          email_confirmed: true
        },
        emailRedirectTo: undefined // Skip email confirmation for development
      }
    })

    if (error) {
      console.error('Registration error:', error)

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
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in.'
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
    } else {
      console.log('✅ Profile created successfully for user:', data.user.id)
    }

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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}