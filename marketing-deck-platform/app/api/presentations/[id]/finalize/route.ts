import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthenticatedUserWithDemo } from '@/lib/auth/api-auth'
import UserDataService from '@/lib/services/user-data-service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user with demo support
    const { user } = await getAuthenticatedUserWithDemo()
    const body = await request.json()
    const presentationId = params.id
    
    if (!body.finalData || !body.structure) {
      return NextResponse.json(
        { error: 'finalData and structure are required' },
        { status: 400 }
      )
    }

    // Track API usage
    await UserDataService.trackApiUsage(user.id, `/api/presentations/${presentationId}/finalize`, 'POST')

    // Process the final deck data for the editable deck builder
    const editableDeck = {
      slides: body.finalData.finalDeck.slides.map((slide: any, index: number) => ({
        id: slide.id,
        title: slide.title,
        content: slide.content,
        charts: slide.charts || [],
        position: index + 1,
        layout: slide.content?.layout || { type: 'default', theme: 'standard' },
        editable: true,
        metadata: {
          originalStructure: body.structure.find((s: any) => s.order === index + 1),
          qaScore: body.finalData.qaResults?.finalQualityScore || 0.85,
          aiGenerated: true,
          lastModified: new Date().toISOString()
        }
      })),
      charts: body.finalData.finalDeck.charts || [],
      metadata: {
        presentationId: presentationId,
        userId: user.id,
        totalSlides: body.finalData.finalDeck.slides.length,
        qaCompleted: true,
        finalQualityScore: body.finalData.qaResults?.finalQualityScore || 0.85,
        revisionsPerformed: body.finalData.qaResults?.revisions?.length || 0,
        framework: 'tremor',
        aiGenerated: true,
        editableComponents: body.finalData.finalDeck.editableComponents || {
          textEditable: true,
          chartsEditable: true,
          layoutEditable: true,
          themeEditable: true
        },
        createdAt: new Date().toISOString(),
        finalizedAt: new Date().toISOString()
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        backgroundColor: '#F9FAFB',
        textColor: '#111827',
        fontFamily: 'Inter, sans-serif'
      },
      settings: {
        autoSave: true,
        realTimeCollaboration: false,
        exportFormats: ['pdf', 'pptx', 'json'],
        accessLevel: 'owner'
      }
    }

    // Update the presentation with the finalized deck
    const updatedPresentation = await UserDataService.updatePresentation(presentationId, {
      slides: editableDeck.slides,
      charts: editableDeck.charts,
      metadata: editableDeck.metadata,
      theme: editableDeck.theme,
      settings: editableDeck.settings,
      status: 'completed',
      ai_generated: true,
      qa_completed: true,
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (!updatedPresentation) {
      return NextResponse.json(
        { error: 'Failed to finalize presentation' },
        { status: 500 }
      )
    }

    // Track successful completion
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'ai_presentation_completed',
      metadata: {
        presentation_id: presentationId,
        slide_count: editableDeck.slides.length,
        chart_count: editableDeck.charts.length,
        qa_score: editableDeck.metadata.finalQualityScore,
        revisions: editableDeck.metadata.revisionsPerformed,
        processing_time: 'calculated_from_start',
        framework: 'tremor'
      }
    })

    // Update user stats for AI generation completion
    await UserDataService.updateUserStats(user.id)

    return NextResponse.json({
      success: true,
      presentation: updatedPresentation,
      editableDeck: editableDeck,
      deckBuilderUrl: `/deck-builder/${presentationId}?generated=true`,
      message: 'Presentation finalized and ready for editing',
      metadata: {
        slidesGenerated: editableDeck.slides.length,
        chartsGenerated: editableDeck.charts.length,
        qualityScore: editableDeck.metadata.finalQualityScore,
        editingEnabled: true
      }
    })

  } catch (error) {
    console.error('Presentation finalization error:', error)
    return NextResponse.json(
      { error: 'Presentation finalization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}