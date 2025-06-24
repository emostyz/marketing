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
    
    // Get recent user events with user details
    const { data: recentEvents, error } = await supabase
      .from('user_events')
      .select(`
        id,
        event_type,
        event_data,
        created_at,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recent activity' },
        { status: 500 }
      )
    }

    const activities = recentEvents?.map((event: any) => ({
      id: event.id,
      type: event.event_type,
      user: event.profiles?.full_name || event.profiles?.email || 'Unknown User',
      action: formatEventAction(event.event_type, event.event_data),
      timestamp: formatTimestamp(event.created_at),
      details: event.event_data
    })) || []

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Admin recent activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}

function formatEventAction(eventType: string, eventData: any): string {
  switch (eventType) {
    case 'registration_successful':
      return 'Created new account'
    case 'login_success':
      return 'Signed in'
    case 'file_upload_completed':
      return `Uploaded ${eventData?.processed_files || 1} file(s)`
    case 'presentation_analysis_completed':
      return `Generated presentation with ${eventData?.slides_count || 0} slides`
    case 'presentation_created':
      return 'Created new presentation'
    case 'presentation_opened':
      return 'Opened presentation'
    case 'presentation_exported':
      return 'Exported presentation'
    case 'create_presentation_clicked':
      return 'Started creating presentation'
    default:
      return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}