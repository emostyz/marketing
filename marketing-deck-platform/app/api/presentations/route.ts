import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import UserDataService from '@/lib/services/user-data-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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
    const supabase = createRouteHandlerClient({ cookies })
    
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
      tags: presentationData.tags || []
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