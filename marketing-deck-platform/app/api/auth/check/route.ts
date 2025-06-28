import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get project ref from env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
    const cookieName = `sb-${projectRef}-auth-token`

    // Log all cookies for debugging
    console.log('🔍 Cookies received:', request.cookies.getAll())

    // Get the auth token from cookies - try multiple cookie name patterns
    const cookieNames = [
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-auth-token.0`,
      `sb-${projectRef}-auth-token.1`,
      'supabase-auth-token',
      'supabase.auth.token'
    ]
    
    let authToken = null
    for (const name of cookieNames) {
      const cookie = request.cookies.get(name)?.value
      if (cookie && cookie.length > 20 && cookie.includes('.')) {
        authToken = cookie
        console.log(`🔍 Found valid auth token in cookie: ${name}`)
        break
      }
    }

    if (!authToken) {
      console.log('❌ No valid auth token found in any cookies')
      return NextResponse.json({ user: null, session: null })
    }

    // Create Supabase client with the auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Set the session manually
    const { data: { user }, error } = await supabase.auth.getUser(authToken)

    if (error || !user) {
      console.log('❌ Invalid auth token:', error?.message)
      return NextResponse.json({ user: null, session: null })
    }

    console.log('✅ Valid auth token found for user:', user.email)

    // Get user profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const userData = {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || user.email || 'User',
      subscription: profile?.subscription || 'free',
      demo: false,
      profile: profile ? {
        company: profile.company_name,
        industry: profile.industry,
        jobTitle: profile.job_title,
        businessContext: profile.business_context,
        targetAudience: profile.target_audience
      } : null
    }

    return NextResponse.json({ 
      user: userData, 
      session: { access_token: authToken, user: userData }
    })

  } catch (error) {
    console.error('❌ Error checking auth:', error)
    return NextResponse.json({ user: null, session: null })
  }
} 