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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already an admin
    if (user.user_role === 'admin') {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      )
    }

    // Promote user to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_role: 'admin' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error promoting user:', updateError)
      return NextResponse.json(
        { error: 'Failed to promote user' },
        { status: 500 }
      )
    }

    // Log admin activity
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'user_promoted',
        { 
          promoted_user_id: userId,
          promoted_user_email: user.email,
          promoted_user_name: user.full_name
        },
        'users',
        userId,
        request
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `User ${user.email} has been promoted to admin`
    })

  } catch (error) {
    console.error('Admin promote user error:', error)
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    )
  }
}