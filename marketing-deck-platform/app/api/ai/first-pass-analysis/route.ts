import { NextRequest, NextResponse } from 'next/server'
import { firstPassAnalysis, type AnalysisContext } from '@/lib/ai/openai-first-pass-analysis'
import { DataIntakeSystem } from '@/lib/data/data-intake-system'
import { supabase } from '@/lib/supabase/client'
import { ClientAuth } from '@/lib/auth/client-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 First-pass analysis API called')
    
    // Get user authentication
    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { datasetId, context, sessionId } = body

    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: 'Dataset ID is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Processing analysis for dataset: ${datasetId}`)

    // Retrieve dataset from the data intake system
    const dataIntakeSystem = new DataIntakeSystem()
    const datasetResult = await dataIntakeSystem.getDataset(datasetId)
    
    if (!datasetResult.success || !datasetResult.data) {
      return NextResponse.json(
        { success: false, error: datasetResult.error || 'Dataset not found' },
        { status: 404 }
      )
    }

    const dataset = datasetResult.data

    // Verify user owns the dataset
    if (dataset.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to dataset' },
        { status: 403 }
      )
    }

    // Prepare analysis context
    const analysisContext: AnalysisContext = {
      userGoals: context?.userGoals || 'Generate actionable business insights',
      businessContext: context?.businessContext || 'General business analysis',
      industryType: context?.industryType,
      timeframe: context?.timeframe,
      specificQuestions: context?.specificQuestions || [],
      comparisonBenchmarks: context?.comparisonBenchmarks || []
    }

    console.log('🔄 Starting OpenAI first-pass analysis...')

    // Perform the analysis
    const analysisResult = await firstPassAnalysis.analyzeDataset(
      dataset,
      analysisContext,
      sessionId || `${user.id}_${Date.now()}`
    )

    if (!analysisResult.success) {
      console.error('❌ Analysis failed:', analysisResult.error)
      
      // Log failure for debugging
      await logAnalysisAttempt(user.id, datasetId, {
        success: false,
        error: analysisResult.error,
        context: analysisContext
      })

      return NextResponse.json(
        { 
          success: false, 
          error: analysisResult.error || 'Analysis failed',
          fallbackAvailable: true
        },
        { status: 500 }
      )
    }

    console.log('✅ Analysis completed successfully')
    console.log(`📈 Generated ${analysisResult.data?.keyFindings.length} findings`)

    // Save analysis results to database
    const saveResult = await saveAnalysisResults(user.id, datasetId, analysisResult, analysisContext)
    
    if (!saveResult.success) {
      console.warn('⚠️ Failed to save analysis results:', saveResult.error)
      // Continue - don't fail the API call for save errors
    }

    // Log successful analysis
    await logAnalysisAttempt(user.id, datasetId, {
      success: true,
      metadata: analysisResult.metadata,
      context: analysisContext
    })

    // Return results
    return NextResponse.json({
      success: true,
      data: analysisResult.data,
      metadata: analysisResult.metadata,
      datasetInfo: {
        filename: dataset.filename,
        rows: dataset.rows,
        columns: dataset.columns.length,
        uploadedAt: dataset.uploadedAt
      }
    })

  } catch (error) {
    console.error('❌ First-pass analysis API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        fallbackAvailable: true
      },
      { status: 500 }
    )
  }
}

/**
 * Generate fallback analysis when main analysis fails
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const datasetId = url.searchParams.get('datasetId')
    
    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: 'Dataset ID is required' },
        { status: 400 }
      )
    }

    // Get user authentication
    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔄 Generating fallback analysis...')

    // Get dataset
    const dataIntakeSystem = new DataIntakeSystem()
    const datasetResult = await dataIntakeSystem.getDataset(datasetId)
    
    if (!datasetResult.success || !datasetResult.data) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    const dataset = datasetResult.data

    // Verify user owns the dataset
    if (dataset.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to dataset' },
        { status: 403 }
      )
    }

    // Generate fallback analysis
    const fallbackAnalysis = await firstPassAnalysis.generateFallbackAnalysis(dataset)

    console.log('✅ Fallback analysis generated')

    return NextResponse.json({
      success: true,
      data: fallbackAnalysis,
      isFallback: true,
      metadata: {
        processingTime: 500,
        datasetSummary: {
          rows: dataset.rows,
          columns: dataset.columns.length,
          numericFields: dataset.metadata.numericColumns?.length || 0,
          categoricalFields: dataset.metadata.categoricalColumns?.length || 0
        },
        modelUsed: 'fallback-generator',
        confidence: 0.6
      }
    })

  } catch (error) {
    console.error('❌ Fallback analysis error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Fallback analysis failed'
      },
      { status: 500 }
    )
  }
}

/**
 * Save analysis results to database
 */
async function saveAnalysisResults(
  userId: string,
  datasetId: string,
  analysisResult: any,
  context: AnalysisContext
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ai_analysis_results')
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        analysis_type: 'first_pass',
        analysis_data: analysisResult.data,
        metadata: analysisResult.metadata,
        context: context,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Database save error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Database save failed' 
    }
  }
}

/**
 * Log analysis attempts for monitoring
 */
async function logAnalysisAttempt(
  userId: string,
  datasetId: string,
  attempt: any
): Promise<void> {
  try {
    await supabase
      .from('ai_analysis_logs')
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        attempt_data: attempt,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.warn('Failed to log analysis attempt:', error)
  }
}