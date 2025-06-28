import { NextRequest, NextResponse } from 'next/server'
import { analyzeDataAgent } from '@/lib/agents/analyze-data-agent'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

async function updateProgress(sessionId: string, stage: string, status: string, progress: number, data?: any) {
  if (!sessionId) return
  
  try {
    const supabase = await createServerSupabaseClient()
    await supabase
      .from('ai_processing_queue')
      .update({
        pipeline_stage: stage,
        status: status,
        output_data: data,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
  } catch (error) {
    console.error('Progress update error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body
    
    // Update progress to processing
    if (sessionId) {
      await updateProgress(sessionId, 'first_pass_analysis', 'processing', 25)
    }
    
    // Support multiple analysis types
    if (body.analysisType === 'insights_generation') {
      console.log('🧠 Getting REAL OpenAI insights (no more mock data!)...')
      
      // Get uploaded data - first try from body, then from localStorage simulation
      let uploadedData = body.data
      
      if (!uploadedData || uploadedData.length === 0) {
        console.log('⚠️ No data in request body, this should come from frontend')
        throw new Error('No data provided for insights generation. Please upload data first.')
      }

      console.log(`📊 Analyzing ${uploadedData.length} rows with Ultimate Brain API`)

      // Call Ultimate Brain API for REAL OpenAI analysis
      const ultimateBrainResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/ultimate-brain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: uploadedData,
          context: {
            analysisType: 'insights_generation',
            industry: body.industry || 'business',
            goals: ['strategic insights', 'actionable recommendations'],
            sessionId: sessionId
          },
          userFeedback: body.userFeedback || {},
          learningObjectives: ['Generate strategic business insights', 'Identify key trends and patterns', 'Provide actionable recommendations']
        })
      })

      if (!ultimateBrainResponse.ok) {
        console.error('Ultimate Brain API failed, status:', ultimateBrainResponse.status)
        const errorText = await ultimateBrainResponse.text()
        console.error('Ultimate Brain error:', errorText)
        throw new Error(`Ultimate Brain API failed: ${ultimateBrainResponse.status}`)
      }

      const ultimateBrainResult = await ultimateBrainResponse.json()
      console.log('✅ Ultimate Brain API response received')

      // Extract insights from Ultimate Brain response
      const insights = ultimateBrainResult.analysis?.strategicInsights || []
      
      if (insights.length === 0) {
        console.error('No insights in Ultimate Brain response:', ultimateBrainResult)
        throw new Error('No insights generated from Ultimate Brain API')
      }

      console.log(`🎯 SUCCESS: Generated ${insights.length} REAL OpenAI insights!`)

      // Update progress to completed
      if (sessionId) {
        await updateProgress(sessionId, 'first_pass_analysis', 'completed', 100, { insights: insights })
      }

      return NextResponse.json({ 
        success: true, 
        insights: insights,
        userId: body.userId,
        analysisType: body.analysisType,
        source: 'ultimate_brain_openai'
      })
    }

    // For regular data analysis, require csvData
    if (!body.csvData || !Array.isArray(body.csvData)) {
      return NextResponse.json(
        { error: 'csvData array is required for data analysis' },
        { status: 400 }
      )
    }

    const result = await analyzeDataAgent({
      ...body,
      userId: body.userId,
      chatContinuity: body.chatContinuity
    })

    // Update progress to completed for regular analysis
    if (sessionId) {
      await updateProgress(sessionId, 'first_pass_analysis', 'completed', 100, result)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Data analysis error:', error)
    
    // Update progress to failed if we have sessionId
    if (body.sessionId) {
      await updateProgress(body.sessionId, 'first_pass_analysis', 'failed', 0, { error: error.message })
    }
    
    return NextResponse.json(
      { error: 'Data analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}