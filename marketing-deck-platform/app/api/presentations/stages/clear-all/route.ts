import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { clearAllStages } from '@/lib/db/presentations'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { deckId } = body
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    await clearAllStages(deckId)
    
    return NextResponse.json({
      success: true,
      message: 'All stages cleared successfully'
    })

  } catch (error) {
    console.error('Clear All Stages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}