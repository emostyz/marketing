import { NextRequest, NextResponse } from 'next/server'
import AIProviderManager from '@/lib/services/ai-provider-manager'

export async function POST(request: NextRequest) {
  try {
    const { action, organizationId, userId, ...params } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize AI provider manager
    const aiManager = new AIProviderManager()

    switch (action) {
      case 'configure':
        const configResult = await aiManager.configureProvider(
          organizationId,
          params.config,
          userId
        )
        return NextResponse.json(configResult)

      case 'switch':
        const switchResult = await aiManager.switchProvider(
          organizationId,
          params.providerId,
          params.modelId,
          userId
        )
        return NextResponse.json(switchResult)

      case 'setup_local_llm':
        const localLLMResult = await aiManager.setupLocalLLM(
          organizationId,
          params.config,
          userId
        )
        return NextResponse.json(localLLMResult)

      case 'get_providers':
        const providers = aiManager.getAvailableProviders(params.userPlan)
        return NextResponse.json({ success: true, providers })

      case 'get_usage_stats':
        const stats = await aiManager.getProviderUsageStats(
          organizationId,
          params.timeframe
        )
        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('AI Provider API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userPlan = searchParams.get('userPlan')

    const aiManager = new AIProviderManager()

    if (organizationId) {
      // Get current AI configuration
      const config = await aiManager.getOrganizationAIConfig(organizationId)
      return NextResponse.json({
        success: true,
        currentConfig: config
      })
    } else {
      // Get available providers
      const providers = aiManager.getAvailableProviders(userPlan || undefined)
      return NextResponse.json({
        success: true,
        providers
      })
    }

  } catch (error) {
    console.error('Get AI config error:', error)
    return NextResponse.json({ 
      error: 'Failed to get AI configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}