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

    const { is_active } = await request.json()
    const supabase = await createServerSupabaseClient()
    
    // First get current template info
    const { data: currentTemplate } = await supabase
      .from('admin_templates')
      .select('name, is_active')
      .eq('id', params.id)
      .single()

    if (!currentTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    const { data: template, error } = await supabase
      .from('admin_templates')
      .update({ 
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling template status:', error)
      return NextResponse.json(
        { error: 'Failed to update template status' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_status_toggled',
        { 
          template_id: params.id,
          template_name: currentTemplate.name,
          previous_status: currentTemplate.is_active,
          new_status: is_active
        },
        'templates',
        params.id,
        request
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Admin template toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle template status' },
      { status: 500 }
    )
  }
}