import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { DeckPersistence } from '@/lib/deck-persistence'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const draft = await DeckPersistence.loadDraft(id)
    
    if (!draft) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Track view activity
    await DeckPersistence.trackUserActivity('draft_viewed', {
      draftId: id,
      title: draft.title
    })

    return NextResponse.json({
      success: true,
      presentation: draft
    })
  } catch (error) {
    console.error('Error loading presentation:', error)
    return NextResponse.json(
      { error: 'Failed to load presentation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const updateData = await request.json()
    
    // Load existing draft
    const existingDraft = await DeckPersistence.loadDraft(id)
    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Update draft with new data
    const updatedDraft = await DeckPersistence.saveDraft({
      ...existingDraft,
      ...updateData,
      id: id, // Ensure we keep the same ID
      lastEditedAt: new Date()
    })

    if (!updatedDraft) {
      return NextResponse.json(
        { error: 'Failed to update presentation' },
        { status: 500 }
      )
    }

    // Track update activity
    await DeckPersistence.trackUserActivity('draft_updated', {
      draftId: id,
      title: updatedDraft.title,
      changes: Object.keys(updateData)
    })

    return NextResponse.json({
      success: true,
      presentation: updatedDraft
    })
  } catch (error) {
    console.error('Error updating presentation:', error)
    return NextResponse.json(
      { error: 'Failed to update presentation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const success = await DeckPersistence.deleteDraft(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete presentation' },
        { status: 500 }
      )
    }

    // Track deletion activity
    await DeckPersistence.trackUserActivity('draft_deleted', {
      draftId: id
    })

    return NextResponse.json({
      success: true,
      message: 'Presentation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting presentation:', error)
    return NextResponse.json(
      { error: 'Failed to delete presentation' },
      { status: 500 }
    )
  }
}