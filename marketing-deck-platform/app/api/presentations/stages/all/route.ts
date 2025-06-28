import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { getAllStages } from '@/lib/db/presentations'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId parameter is required' },
        { status: 400 }
      )
    }

    const stages = await getAllStages(deckId)
    
    return NextResponse.json(stages)

  } catch (error) {
    console.error('All Stages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}