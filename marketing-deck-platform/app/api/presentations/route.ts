import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import UserDataService from '@/lib/services/user-data-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const isPublic = searchParams.get('isPublic')
    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/presentations', 'GET')
    // Get user presentations
    let presentations = await UserDataService.getUserPresentations(user.id, limit)
    // Apply filters
    if (status) {
      presentations = presentations.filter(p => p.status === status)
    }
    if (isPublic !== null) {
      presentations = presentations.filter(p => p.is_public === (isPublic === 'true'))
    }
    // Track activity
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'presentations_viewed',
      metadata: { 
        count: presentations.length,
        filters: { status, isPublic }
      }
    })
    return NextResponse.json({
      success: true,
      data: presentations,
      count: presentations.length
    })
  } catch (error) {
    console.error('Presentations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const presentationData = await request.json()
    // Validate required fields
    if (!presentationData.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/presentations', 'POST')
    // Create presentation
    const presentation = await UserDataService.createPresentation(user.id, {
      title: presentationData.title,
      description: presentationData.description || '',
      template_id: presentationData.template_id,
      slides: presentationData.slides || [],
      data_sources: presentationData.data_sources || [],
      narrative_config: presentationData.narrative_config || {},
      is_public: presentationData.is_public || false,
      tags: presentationData.tags || [],
      theme: presentationData.theme || {},
      settings: presentationData.settings || {},
      collaborators: presentationData.collaborators || [],
      version: 1,
      last_modified: new Date().toISOString(),
      user_id: user.id
    })
    // Update user stats
    await UserDataService.updateUserStats(user.id)
    return NextResponse.json({
      success: true,
      data: presentation
    })
  } catch (error) {
    console.error('Presentations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const presentationData = await request.json()
    // Validate required fields
    if (!presentationData.id) {
      return NextResponse.json(
        { error: 'Presentation ID is required' },
        { status: 400 }
      )
    }
    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/presentations', 'PUT')
    // Update presentation
    const { data: existingPresentation } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', presentationData.id)
      .eq('user_id', user.id)
      .single()
    if (!existingPresentation) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }
    const { data: updatedPresentation, error: updateError } = await supabase
      .from('presentations')
      .update({
        title: presentationData.title || existingPresentation.title,
        description: presentationData.description || existingPresentation.description,
        slides: presentationData.slides || existingPresentation.slides,
        theme: presentationData.theme || existingPresentation.theme,
        settings: presentationData.settings || existingPresentation.settings,
        collaborators: presentationData.collaborators || existingPresentation.collaborators,
        version: (existingPresentation.version || 0) + 1,
        last_modified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      })
      .eq('id', presentationData.id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (updateError) {
      throw updateError
    }
    // Track activity
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'presentation_updated',
      metadata: { 
        presentation_id: presentationData.id,
        slides_count: presentationData.slides?.length || 0
      }
    })
    return NextResponse.json({
      success: true,
      data: updatedPresentation
    })
  } catch (error) {
    console.error('Presentations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}