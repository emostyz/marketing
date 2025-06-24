import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
      }

      if (session?.access_token) {
        // Get project ref from env for cookie name
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
        const cookieName = `sb-${projectRef}-auth-token`

        // Create response and set auth cookie
        const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        
        response.cookies.set(cookieName, session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        console.log('✅ Auth callback successful, cookie set for:', session.user.email)
        return response
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
    }
  }

  // Fallback - redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
}