import { NextRequest, NextResponse } from 'next/server'
import { UniversalBrain } from '@/lib/ai/universal-brain'
import { AuthSystem } from '@/lib/auth/auth-system'

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Universal AI Analysis - Starting request processing')
    
    const body = await request.json()
    const {
      data,
      context,
      timeFrame,
      requirements,
      userFeedback = [],
      preferredProvider
    } = body

    console.log('🧠 Universal Analysis - Request received:', {
      dataLength: data?.length,
      contextKeys: context ? Object.keys(context) : null,
      preferredProvider: preferredProvider || 'default'
    })

    // Validate required fields
    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      )
    }

    if (!context || !timeFrame || !requirements) {
      return NextResponse.json(
        { error: 'Context, timeFrame, and requirements are required' },
        { status: 400 }
      )
    }

    // Get user context
    let userProfile = null
    let userId = null
    try {
      userProfile = await AuthSystem.getUserProfile()
      userId = userProfile?.id
      console.log('🧠 Universal Analysis - User profile retrieved:', userProfile ? 'Yes' : 'No')
    } catch (error) {
      console.log('🧠 Universal Analysis - No user profile available (guest user)')
    }

    // Process data array if needed
    let processedData = data
    if (Array.isArray(data) && data.length > 0 && data[0].data) {
      console.log('🧠 Universal Analysis - Processing file data array')
      processedData = data.map(file => file.data).flat()
      console.log('🧠 Universal Analysis - Flattened data length:', processedData.length)
    }

    // Enhance context with user profile
    const enhancedContext = {
      ...context,
      userProfile: userProfile ? {
        companyName: userProfile.companyName,
        industry: userProfile.industry,
        targetAudience: userProfile.targetAudience,
        businessContext: userProfile.businessContext,
        keyMetrics: userProfile.keyMetrics,
        dataPreferences: userProfile.dataPreferences
      } : null
    }

    // Create universal brain request
    const brainRequest = {
      data: processedData,
      context: enhancedContext,
      timeFrame: {
        start: timeFrame.start || 'Not specified',
        end: timeFrame.end || 'Not specified',
        dataFrequency: timeFrame.dataFrequency || 'unknown',
        analysisType: timeFrame.analysisType || 'trend',
        comparisons: timeFrame.comparisons || []
      },
      requirements: {
        slidesCount: requirements.slidesCount || 10,
        presentationDuration: requirements.presentationDuration || 15,
        focusAreas: requirements.focusAreas || ['Key Insights'],
        style: requirements.style || 'professional',
        includeCharts: true
      },
      userFeedback,
      userId: userId || undefined,
      preferredProvider
    }

    console.log('🧠 Universal Analysis - Initializing Universal Brain...')
    const universalBrain = new UniversalBrain()

    console.log('🧠 Universal Analysis - Performing analysis...')
    const result = await universalBrain.analyzeData(brainRequest)

    console.log(`🧠 Universal Analysis - Complete! Provider: ${result.metadata.provider}, Model: ${result.metadata.model}`)
    console.log(`🧠 Insights: ${result.insights.length}, Slides: ${result.slideStructure.length}`)

    return NextResponse.json({
      success: true,
      result: {
        insights: result.insights,
        narrative: result.narrative,
        slideStructure: result.slideStructure,
        metadata: result.metadata
      },
      metadata: {
        provider: result.metadata.provider,
        model: result.metadata.model,
        processingTime: result.metadata.processingTime,
        tokenUsage: result.metadata.tokenUsage,
        dataSampling: result.metadata.dataSampling,
        deepInsights: result.metadata.deepInsights,
        analysisDepth: result.metadata.analysisDepth,
        confidence: result.metadata.confidence,
        noveltyScore: result.metadata.noveltyScore,
        businessImpact: result.metadata.businessImpact,
        dataQuality: result.metadata.dataQuality,
        insightsCount: result.insights.length,
        slidesCount: result.slideStructure.length
      }
    })

  } catch (error) {
    console.error('❌ Universal AI analysis error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Universal AI analysis failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}