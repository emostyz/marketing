import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json()
    if (!access_token) {
      return NextResponse.json({ error: 'Missing access_token' }, { status: 400 })
    }

    // Get project ref from env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'waddrfstpqkvdfwbxvfw'
    const cookieName = `sb-${projectRef}-auth-token`

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieName, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // Revert to lax for localhost compatibility
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 