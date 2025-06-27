import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs array is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Check if any of the users are admins (prevent deleting all admins)
    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id, user_role')
      .in('id', userIds)
      .eq('user_role', 'admin')

    // Get total admin count
    const { count: totalAdmins } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_role', 'admin')

    const adminIdsToDelete = adminUsers?.map(u => u.id) || []
    
    // Prevent deleting all admins
    if (totalAdmins && adminIdsToDelete.length >= totalAdmins) {
      return NextResponse.json(
        { error: 'Cannot delete all admin users. At least one admin must remain.' },
        { status: 400 }
      )
    }

    // Soft delete users by anonymizing them
    const { data: deletedUsers, error } = await supabase
      .from('profiles')
      .update({
        email: `deleted_${Date.now()}@deleted.com`,
        full_name: 'Deleted User',
        company_name: null,
        user_role: 'deleted',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select('id, email')

    if (error) {
      console.error('Bulk delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete users' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'users_bulk_deleted',
        { 
          deleted_count: userIds.length,
          user_ids: userIds
        },
        'users',
        undefined,
        request
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${userIds.length} users`,
      deleted_count: userIds.length
    })
  } catch (error) {
    console.error('Admin bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { userIds, action } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs array is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'activate':
        updateData = { 
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        }
        message = `Activated ${userIds.length} users`
        break

      case 'deactivate':
        updateData = { 
          subscription_status: 'inactive',
          updated_at: new Date().toISOString()
        }
        message = `Deactivated ${userIds.length} users`
        break

      case 'promote':
        updateData = { 
          user_role: 'admin',
          updated_at: new Date().toISOString()
        }
        message = `Promoted ${userIds.length} users to admin`
        break

      case 'demote':
        updateData = { 
          user_role: 'user',
          updated_at: new Date().toISOString()
        }
        message = `Demoted ${userIds.length} users from admin`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .in('id', userIds)

    if (error) {
      console.error('Bulk update error:', error)
      return NextResponse.json(
        { error: 'Failed to update users' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        `users_bulk_${action}`,
        { 
          affected_count: userIds.length,
          user_ids: userIds,
          action
        },
        'users',
        undefined,
        request
      )
    }

    return NextResponse.json({
      success: true,
      message,
      affected_count: userIds.length
    })
  } catch (error) {
    console.error('Admin bulk update error:', error)
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    )
  }
}