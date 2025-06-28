import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()
    
    const { insightId, vote } = await request.json()
    
    console.log(`👤 User: ${user.id.slice(0, 8)}...${user.id.slice(-4)} (Demo: false)`)
    console.log(`📝 Feedback received: ${insightId} → ${vote}`)
    
    // Validate input
    if (!insightId || !vote) {
      return NextResponse.json(
        { error: 'Missing insightId or vote' },
        { status: 400 }
      )
    }

    if (!['thumbsup', 'thumbsdown'].includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be thumbsup or thumbsdown' },
        { status: 400 }
      )
    }

    // TODO: Store feedback in database or analytics service
    // For now, we'll just log it and return success
    // In a full implementation, you might:
    // 1. Store in Supabase analytics table
    // 2. Send to OpenAI for fine-tuning
    // 3. Update user preference models
    // 4. Track insight performance metrics

    const feedbackRecord = {
      userId: user.id,
      insightId,
      vote,
      timestamp: new Date().toISOString(),
      userProfile: {
        subscription: user.subscription,
        company: user.profile?.company,
        industry: user.profile?.industry
      }
    }

    console.log('💾 Feedback record created:', feedbackRecord)

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedbackId: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error('❌ Feedback API error:', error)
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}