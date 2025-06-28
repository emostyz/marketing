import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { saveMultipleStages, ensurePresentationExists } from '@/lib/db/presentations'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { deckId, stages } = body
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    if (!stages || Object.keys(stages).length === 0) {
      return NextResponse.json(
        { error: 'stages data is required' },
        { status: 400 }
      )
    }

    // Ensure presentation exists
    await ensurePresentationExists(deckId)

    await saveMultipleStages(deckId, stages)
    
    return NextResponse.json({
      success: true,
      message: 'Multiple stages saved successfully'
    })

  } catch (error) {
    console.error('Multiple Stages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}