import { NextRequest, NextResponse } from 'next/server'
import { EnhancedBrainV2 } from '@/lib/ai/enhanced-brain-v2'

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Enhanced Analysis - Starting request processing')
    
    const body = await request.json()
    console.log('🧠 Enhanced Analysis - Request body received:', Object.keys(body))
    
    const {
      data,
      context,
      timeFrame,
      requirements,
      userFeedback = []
    } = body

    console.log('🧠 Enhanced Analysis - Extracted data:', {
      dataLength: data?.length,
      contextKeys: context ? Object.keys(context) : null,
      timeFrameKeys: timeFrame ? Object.keys(timeFrame) : null,
      requirementsKeys: requirements ? Object.keys(requirements) : null
    })

    // Validate required fields
    if (!data) {
      console.log('❌ Enhanced Analysis - Missing data')
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      )
    }

    if (!context || !timeFrame || !requirements) {
      console.log('❌ Enhanced Analysis - Missing required fields')
      return NextResponse.json(
        { error: 'Context, timeFrame, and requirements are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ Enhanced Analysis - No OpenAI API key')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('🧠 Enhanced Analysis - All validations passed, initializing brain')

    // Transform timeFrame to match EnhancedBrainV2 expectations
    const mapAnalysisType = (comparisons: string[] = []) => {
      const typeMap: Record<string, 'q/q' | 'y/y' | 'm/m' | 'w/w'> = {
        'qq': 'q/q',
        'yy': 'y/y', 
        'mm': 'm/m',
        'ww': 'w/w'
      }
      return comparisons.length > 0 && typeMap[comparisons[0]] ? typeMap[comparisons[0]] : 'custom' as const
    }

    const transformedTimeFrame = {
      primaryPeriod: {
        start: timeFrame.start || 'Not specified',
        end: timeFrame.end || 'Not specified',
        label: `${timeFrame.start || 'Start'} to ${timeFrame.end || 'End'}`
      },
      analysisType: mapAnalysisType(timeFrame.comparisons),
      includeTrends: true,
      includeSeasonality: timeFrame.dataFrequency === 'monthly' || timeFrame.dataFrequency === 'quarterly',
      includeOutliers: true
    }

    // Transform requirements to match EnhancedBrainV2 expectations
    const transformedRequirements = {
      slideCount: requirements.slidesCount || 10,
      targetDuration: requirements.presentationDuration || 15,
      structure: 'ai_suggested' as const,
      keyPoints: requirements.focusAreas && requirements.focusAreas.length > 0 
        ? requirements.focusAreas 
        : ['Key insights from data', 'Business recommendations'],
      slideDescriptions: [],
      audienceType: 'executive' as const,
      presentationStyle: requirements.style === 'modern' ? 'storytelling' as const : 'formal' as const,
      includeAppendix: true,
      includeSources: true
    }

    console.log('🧠 Enhanced Analysis - Transformed timeFrame:', transformedTimeFrame)
    console.log('🧠 Enhanced Analysis - Transformed requirements:', transformedRequirements)

    // Initialize enhanced brain
    const brain = new EnhancedBrainV2(process.env.OPENAI_API_KEY)

    console.log('🧠 Enhanced Analysis - Brain initialized, performing analysis...')

    // Perform comprehensive analysis
    const result = await brain.analyzeData(
      data,
      context,
      transformedTimeFrame,
      transformedRequirements,
      userFeedback
    )

    console.log(`🧠 Enhanced Analysis - Completed with ${result.insights.length} insights`)

    // Return the analysis result
    return NextResponse.json({
      success: true,
      result,
      metadata: {
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
    console.error('❌ Enhanced analysis error:', error)
    
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please check your OpenAI account.' },
          { status: 402 }
        )
      }
      
      if (error.message.includes('invalid api key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your configuration.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An error occurred during analysis. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 