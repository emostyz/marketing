import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

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

    const supabase = await createServerSupabaseClient()
    
    const { data: template, error } = await supabase
      .from('admin_templates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_viewed',
        { template_id: params.id, template_name: template.name },
        'templates',
        params.id,
        request
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Admin template fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const updateData = await request.json()
    const supabase = await createServerSupabaseClient()
    
    const { data: template, error } = await supabase
      .from('admin_templates')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_updated',
        { 
          template_id: params.id,
          template_name: template.name,
          updated_fields: Object.keys(updateData)
        },
        'templates',
        params.id,
        request
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Admin template update error:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const supabase = await createServerSupabaseClient()
    
    // First get template info for logging
    const { data: template } = await supabase
      .from('admin_templates')
      .select('name')
      .eq('id', params.id)
      .single()
    
    const { error } = await supabase
      .from('admin_templates')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting template:', error)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_deleted',
        { 
          template_id: params.id,
          template_name: template?.name || 'Unknown'
        },
        'templates',
        params.id,
        request
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin template deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}