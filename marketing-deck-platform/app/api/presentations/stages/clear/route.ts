import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { clearStageData } from '@/lib/db/presentations'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { deckId, stage } = body
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    if (!stage) {
      return NextResponse.json(
        { error: 'stage name is required' },
        { status: 400 }
      )
    }

    const validStages = ['insights', 'outline', 'styled_slides', 'chart_data', 'final_deck']
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      )
    }

    await clearStageData(deckId, stage as any)
    
    return NextResponse.json({
      success: true,
      message: `Stage ${stage} cleared successfully`
    })

  } catch (error) {
    console.error('Clear Stage API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}