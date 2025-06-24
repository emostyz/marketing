import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Get user presentations
    const { data: presentations, error: presentationsError } = await supabase
      .from('presentations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (presentationsError) {
      console.error('Presentations fetch error:', presentationsError)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: profile || null,
      },
      presentations: presentations || [],
      stats: {
        totalPresentations: presentations?.length || 0,
        recentPresentations: presentations?.slice(0, 5) || [],
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 