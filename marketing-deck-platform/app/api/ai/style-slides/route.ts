import { NextRequest, NextResponse } from 'next/server'
import { styleSlidesAgent } from '@/lib/agents/style-slides-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.slideOutline) {
      return NextResponse.json(
        { error: 'slideOutline is required' },
        { status: 400 }
      )
    }

    const result = await styleSlidesAgent(body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Slide styling error:', error)
    return NextResponse.json(
      { error: 'Slide styling failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}