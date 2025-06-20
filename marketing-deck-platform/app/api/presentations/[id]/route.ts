import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { getPresentation, deletePresentation, presentationStorage } from '@/lib/storage/presentation-storage'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const user = await AuthSystem.getCurrentUser()
    const presentation = await getPresentation(params.id)

    if (!presentation) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this presentation
    if (!presentation.isPublic && (!user || presentation.userId !== user.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      presentation
    })
  } catch (error) {
    console.error('Get presentation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const user = await AuthSystem.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const presentation = await getPresentation(params.id)

    if (!presentation) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    if (presentation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const {
      title,
      slides,
      description,
      tags,
      isPublic,
      theme
    } = await request.json()

    // Update the presentation
    const updatedId = await presentationStorage.savePresentation({
      ...presentation,
      id: params.id,
      title: title || presentation.title,
      slides: slides || presentation.slides,
      description: description !== undefined ? description : presentation.description,
      tags: tags || presentation.tags,
      isPublic: isPublic !== undefined ? isPublic : presentation.isPublic,
      theme: theme || presentation.theme
    })

    return NextResponse.json({
      success: true,
      presentationId: updatedId,
      message: 'Presentation updated successfully'
    })
  } catch (error) {
    console.error('Update presentation error:', error)
    return NextResponse.json(
      { error: 'Failed to update presentation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const user = await AuthSystem.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const success = await deletePresentation(params.id, user.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Presentation not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Presentation deleted successfully'
    })
  } catch (error) {
    console.error('Delete presentation error:', error)
    return NextResponse.json(
      { error: 'Failed to delete presentation' },
      { status: 500 }
    )
  }
}