import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server-client'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // For development, try admin auth to bypass email confirmation
    let data: any, error: any;
    
    // First try normal login
    const loginResult = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    data = loginResult.data
    error = loginResult.error
    
    // If email not confirmed, try to manually confirm and login for development
    if (error && error.message.includes('Email not confirmed') && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: attempting to bypass email confirmation')
      
      // Use admin client to confirm email and try again
      try {
        const adminSupabase = createAdminSupabaseClient()
        
        // Get user by email to find their ID
        const { data: adminData } = await adminSupabase.auth.admin.listUsers()
        const user = adminData.users?.find(u => u.email === email)
        
        if (user) {
          // Manually confirm the user
          const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
            email_confirm: true
          })
          
          if (updateError) {
            console.error('Failed to confirm email:', updateError)
          } else {
            console.log('✅ Email confirmed for development user:', email)
            
            // Try login again
            const retryResult = await supabase.auth.signInWithPassword({
              email,
              password
            })
            
            data = retryResult.data
            error = retryResult.error
          }
        }
      } catch (adminError) {
        console.error('Admin auth error:', adminError)
        // Continue with original error
      }
    }

    if (error) {
      console.error('Login error:', error)

      // Provide specific error messages
      let errorMessage = 'Invalid email or password'
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.'
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

    // Return successful response
    return NextResponse.json(
      { 
        success: true, 
        user: data.user,
        session: data.session 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login route error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}