import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { savePresentation, getUserPresentations } from '@/lib/storage/presentation-storage'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const presentations = await getUserPresentations(user.id)

    return NextResponse.json({
      success: true,
      presentations: presentations.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags,
        theme: p.theme,
        slideCount: p.slides.length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        isPublic: p.isPublic
      }))
    })
  } catch (error) {
    console.error('Get presentations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const {
      title,
      slides,
      description,
      tags = [],
      isPublic = false,
      theme = 'dark',
      qaResponses,
      originalData
    } = await request.json()

    if (!title || !slides) {
      return NextResponse.json(
        { error: 'Title and slides are required' },
        { status: 400 }
      )
    }

    const presentationId = await savePresentation(slides, title, user.id, {
      description,
      tags,
      isPublic,
      theme,
      qaResponses,
      originalData
    })

    return NextResponse.json({
      success: true,
      presentationId,
      message: 'Presentation saved successfully'
    })
  } catch (error) {
    console.error('Save presentation error:', error)
    return NextResponse.json(
      { error: 'Failed to save presentation' },
      { status: 500 }
    )
  }
}