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
    
    // Get all templates with usage statistics
    const { data: templates, error } = await supabase
      .from('admin_templates')
      .select(`
        id,
        name,
        description,
        category,
        template_type,
        slide_structure,
        design_settings,
        usage_count,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'templates_list_viewed',
        { template_count: templates?.length || 0 },
        'templates',
        undefined,
        request
      )
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error('Admin templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const {
      name,
      description,
      category,
      template_type = 'presentation',
      slide_structure = [],
      design_settings = {}
    } = await request.json()

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    const { data: template, error } = await supabase
      .from('admin_templates')
      .insert({
        name,
        description,
        category,
        template_type,
        slide_structure,
        design_settings,
        created_by: admin?.id,
        is_active: true,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_created',
        { 
          template_id: template.id,
          template_name: name,
          category
        },
        'templates',
        template.id,
        request
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Admin template creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}