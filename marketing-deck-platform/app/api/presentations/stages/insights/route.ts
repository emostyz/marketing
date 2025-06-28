import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { saveInsights, getInsights, ensurePresentationExists } from '@/lib/db/presentations'

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

    const insights = await getInsights(deckId)
    
    return NextResponse.json({
      success: true,
      data: insights
    })

  } catch (error) {
    console.error('Insights API error:', error)
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
    const { deckId, data } = body
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'insights data is required' },
        { status: 400 }
      )
    }

    // Ensure presentation exists
    await ensurePresentationExists(deckId)

    await saveInsights(deckId, data)
    
    return NextResponse.json({
      success: true,
      message: 'Insights saved successfully'
    })

  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}