import { NextRequest, NextResponse } from 'next/server'
import MasterBrain from '@/lib/ai/master-brain'

export async function POST(request: NextRequest) {
  try {
    const { providerId, organizationId } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    const masterBrain = new MasterBrain()
    await masterBrain.initialize(organizationId)

    // Test the provider with a simple request
    const testRequest = {
      userId: 'test',
      organizationId: organizationId,
      data: [{ test: 'data' }],
      context: {
        industry: 'test',
        targetAudience: 'test',
        businessContext: 'Provider test',
        description: 'Testing provider connectivity'
      },
      timeFrame: {
        primaryPeriod: { start: '2024-01-01', end: '2024-01-31', label: 'Test' },
        analysisType: 'custom' as const,
        includeTrends: false,
        includeSeasonality: false,
        includeOutliers: false
      },
      requirements: { test: true },
      userTier: 'enterprise' as const
    }

    const result = await masterBrain.processAnalysis(testRequest)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Provider test successful' : 'Provider test failed',
      error: result.error,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Brain test API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Provider test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}