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

    // Check if user is already a regular user
    if (user.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 400 }
      )
    }

    // Prevent self-demotion
    if (admin && admin.id === userId) {
      return NextResponse.json(
        { error: 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    // Demote user to regular user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_role: 'user' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error demoting user:', updateError)
      return NextResponse.json(
        { error: 'Failed to demote user' },
        { status: 500 }
      )
    }

    // Log admin activity
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'user_demoted',
        { 
          demoted_user_id: userId,
          demoted_user_email: user.email,
          demoted_user_name: user.full_name
        },
        'users',
        userId,
        request
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `User ${user.email} has been demoted to regular user`
    })

  } catch (error) {
    console.error('Admin demote user error:', error)
    return NextResponse.json(
      { error: 'Failed to demote user' },
      { status: 500 }
    )
  }
}