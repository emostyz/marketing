import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get project ref from env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
    const cookieName = `sb-${projectRef}-auth-token`

    // Get the auth token from cookies
    const authToken = request.cookies.get(cookieName)?.value

    if (!authToken) {
      return NextResponse.json({ valid: false, error: 'No auth token' }, { status: 401 })
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

    // Verify the session is still valid
    const { data: { user }, error } = await supabase.auth.getUser(authToken)

    if (error || !user) {
      console.log('❌ Session invalid during heartbeat:', error?.message)
      return NextResponse.json({ valid: false, error: 'Invalid session' }, { status: 401 })
    }

    // Refresh the cookie with new expiration
    const response = NextResponse.json({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      }
    })

    response.cookies.set(cookieName, authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    console.log('💓 Session heartbeat successful for:', user.email)
    return response

  } catch (error) {
    console.error('❌ Heartbeat error:', error)
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 })
  }
}