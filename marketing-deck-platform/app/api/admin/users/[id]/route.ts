import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const userId = params.id
    const { action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    let result
    let message = ''

    switch (action) {
      case 'promote':
        result = await AdminAuth.makeAdmin(userId, admin?.id || 'direct-admin')
        if (result.success) {
          message = 'User promoted to admin successfully'
        } else {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        break

      case 'demote':
        result = await AdminAuth.removeAdmin(userId, admin?.id || 'direct-admin')
        if (result.success) {
          message = 'Admin privileges removed successfully'
        } else {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        break

      case 'activate':
        const { error: activateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (activateError) {
          return NextResponse.json({ error: 'Failed to activate user' }, { status: 500 })
        }
        message = 'User activated successfully'
        break

      case 'deactivate':
        const { error: deactivateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (deactivateError) {
          return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
        }
        message = 'User deactivated successfully'
        break

      case 'delete':
        // Soft delete by anonymizing the user
        const { error: deleteError } = await supabase
          .from('profiles')
          .update({
            email: `deleted_${userId}@deleted.com`,
            full_name: 'Deleted User',
            company_name: null,
            user_role: 'deleted',
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (deleteError) {
          return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
        }
        message = 'User deleted successfully'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        `user_${action}`,
        { target_user_id: userId, action },
        'user',
        userId,
        request
      )
    }

    return NextResponse.json({ 
      success: true, 
      message 
    })
  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const userId = params.id
    const supabase = await createServerSupabaseClient()

    // Get user details
    const { data: user, error } = await supabase
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
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's presentations
    const { data: presentations } = await supabase
      .from('presentations')
      .select('id, title, created_at, slides_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get user's uploads
    const { data: uploads } = await supabase
      .from('datasets')
      .select('id, fileName, created_at, fileSize')
      .eq('userId', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get user's recent activity
    const { data: activity } = await supabase
      .from('user_events')
      .select('id, event_type, created_at, event_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'user_details_viewed',
        { target_user_id: userId },
        'user',
        userId,
        request
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        total_presentations: presentations?.length || 0,
        total_uploads: uploads?.length || 0
      },
      presentations: presentations || [],
      uploads: uploads || [],
      activity: activity || []
    })
  } catch (error) {
    console.error('Admin user details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}