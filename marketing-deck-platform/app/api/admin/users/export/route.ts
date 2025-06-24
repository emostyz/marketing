import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function POST(request: NextRequest) {
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

    // Get user details for export
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
      .in('id', userIds)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Get presentation counts for each user
    const { data: presentationCounts } = await supabase
      .from('presentations')
      .select('user_id')
      .in('user_id', userIds)

    // Get upload counts for each user
    const { data: uploadCounts } = await supabase
      .from('datasets')
      .select('userId')
      .in('userId', userIds)

    // Process data and create CSV
    const csvHeaders = [
      'ID',
      'Email',
      'Full Name',
      'Company',
      'Role',
      'Subscription Tier',
      'Subscription Status',
      'Onboarding Completed',
      'Total Presentations',
      'Total Uploads',
      'Created At',
      'Last Updated'
    ]

    const csvRows = users?.map(user => {
      const userPresentations = presentationCounts?.filter(p => p.user_id === user.id).length || 0
      const userUploads = uploadCounts?.filter(u => u.userId === user.id).length || 0

      return [
        user.id,
        user.email,
        user.full_name || '',
        user.company_name || '',
        user.user_role,
        user.subscription_tier,
        user.subscription_status,
        user.onboarding_completed ? 'Yes' : 'No',
        userPresentations,
        userUploads,
        new Date(user.created_at).toLocaleDateString(),
        user.updated_at ? new Date(user.updated_at).toLocaleDateString() : ''
      ]
    }) || []

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(','))
    ].join('\n')

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'users_exported',
        { 
          exported_count: userIds.length,
          user_ids: userIds
        },
        'users',
        undefined,
        request
      )
    }

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Admin user export error:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}