import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Get all users with their profile data and activity stats
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        company_name,
        user_role,
        subscription_tier,
        subscription_status,
        onboarding_completed,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get presentation counts for each user
    const { data: presentationCounts } = await supabase
      .from('presentations')
      .select('user_id, id')

    // Get upload counts for each user
    const { data: uploadCounts } = await supabase
      .from('datasets')
      .select('userId, id')

    // Get recent activity for active user detection
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentActivity } = await supabase
      .from('user_events')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString())

    // Process the data to add activity stats
    const processedUsers = users?.map(user => {
      const userPresentations = presentationCounts?.filter(p => p.user_id === user.id) || []
      const userUploads = uploadCounts?.filter(u => u.userId === user.id) || []
      const hasRecentActivity = recentActivity?.some(a => a.user_id === user.id) || false

      return {
        ...user,
        total_presentations: userPresentations.length,
        total_uploads: userUploads.length,
        is_active: hasRecentActivity,
        last_login: user.updated_at // Placeholder - would need auth.users join for real last_sign_in_at
      }
    }) || []

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'users_list_viewed',
        { user_count: processedUsers.length },
        'users',
        undefined,
        request
      )
    }

    return NextResponse.json({ users: processedUsers })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}