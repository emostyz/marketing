import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import {
  getAllStages,
  saveMultipleStages,
  getStageProgress,
  clearAllStages,
  ensurePresentationExists
} from '@/lib/db/presentations'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    const type = searchParams.get('type')
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId parameter is required' },
        { status: 400 }
      )
    }

    if (type === 'progress') {
      const progress = await getStageProgress(deckId)
      return NextResponse.json({
        success: true,
        data: progress
      })
    }

    // Default: get all stages
    const stages = await getAllStages(deckId)
    return NextResponse.json({
      success: true,
      data: stages
    })

  } catch (error) {
    console.error('Stages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { deckId, stages, action } = body
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    // Ensure presentation exists
    await ensurePresentationExists(deckId)

    if (action === 'clear-all') {
      await clearAllStages(deckId)
      return NextResponse.json({
        success: true,
        message: 'All stages cleared successfully'
      })
    }

    if (!stages) {
      return NextResponse.json(
        { error: 'stages data is required' },
        { status: 400 }
      )
    }

    await saveMultipleStages(deckId, stages)
    
    return NextResponse.json({
      success: true,
      message: 'Stages saved successfully'
    })

  } catch (error) {
    console.error('Stages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}