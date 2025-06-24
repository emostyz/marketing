import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import UserDataService from '@/lib/services/user-data-service'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth()
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
    // Get authenticated user
    const user = await requireAuth()
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
    // Get authenticated user
    const user = await requireAuth()
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
    const updatedPresentation = await UserDataService.updatePresentation(user.id, presentationData.id, {
      title: presentationData.title,
      description: presentationData.description,
      slides: presentationData.slides,
      theme: presentationData.theme,
      settings: presentationData.settings,
      collaborators: presentationData.collaborators,
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    if (!updatedPresentation) {
      return NextResponse.json(
        { error: 'Presentation not found or update failed' },
        { status: 404 }
      )
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