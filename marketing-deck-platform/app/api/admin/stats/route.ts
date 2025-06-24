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
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get total presentations
    const { count: totalPresentations } = await supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })
    
    // Get total uploads
    const { count: totalUploads } = await supabase
      .from('datasets')
      .select('*', { count: 'exact', head: true })
    
    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: activeUsers } = await supabase
      .from('user_events')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
    
    // Get new users today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    // Get presentations created today
    const { count: presentationsToday } = await supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    // Check system health (basic check for now)
    let systemHealth = 'healthy'
    try {
      // Test database connection
      await supabase.from('profiles').select('id').limit(1)
    } catch (error) {
      systemHealth = 'critical'
    }
    
    // Calculate storage usage (mock data for now)
    const storageUsed = '2.3 GB'
    
    // Get API calls count (from events table)
    const { count: apiCalls } = await supabase
      .from('user_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    const stats = {
      totalUsers: totalUsers || 0,
      totalPresentations: totalPresentations || 0,
      totalUploads: totalUploads || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      presentationsToday: presentationsToday || 0,
      systemHealth,
      storageUsed,
      apiCalls: apiCalls || 0
    }

    // Log stats access
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'admin_stats_viewed',
        { stats },
        undefined,
        undefined,
        request
      )
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}