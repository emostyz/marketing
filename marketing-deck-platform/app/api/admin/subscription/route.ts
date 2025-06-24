import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import SubscriptionManager from '@/lib/services/subscription-manager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { action, userId, ...params } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize subscription manager
    const subscriptionManager = new SubscriptionManager()

    switch (action) {
      case 'upgrade':
        const upgradeResult = await subscriptionManager.upgradeSubscription(
          userId,
          params.newPlanId,
          params.immediateUpgrade
        )
        return NextResponse.json(upgradeResult)

      case 'downgrade':
        const downgradeResult = await subscriptionManager.downgradeSubscription(
          userId,
          params.newPlanId,
          params.effectiveDate
        )
        return NextResponse.json(downgradeResult)

      case 'pause':
        const pauseResult = await subscriptionManager.pauseSubscription(
          userId,
          params.pauseSettings
        )
        return NextResponse.json(pauseResult)

      case 'resume':
        const resumeResult = await subscriptionManager.resumeSubscription(userId)
        return NextResponse.json(resumeResult)

      case 'cancel':
        const cancelResult = await subscriptionManager.cancelSubscription(
          userId,
          params.cancelAt,
          params.reason
        )
        return NextResponse.json(cancelResult)

      case 'get_plans':
        const plans = subscriptionManager.getAvailablePlans()
        return NextResponse.json({ success: true, plans })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get current subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    const subscriptionManager = new SubscriptionManager()
    const availablePlans = subscriptionManager.getAvailablePlans()

    return NextResponse.json({
      success: true,
      currentSubscription: subscription,
      availablePlans
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ 
      error: 'Failed to get subscription info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}