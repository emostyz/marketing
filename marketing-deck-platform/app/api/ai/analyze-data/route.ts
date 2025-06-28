import { NextRequest, NextResponse } from 'next/server'
import { analyzeDataAgent } from '@/lib/agents/analyze-data-agent'
import { createClient } from '@/lib/supabase/server'

async function updateProgress(sessionId: string, stage: string, status: string, progress: number, data?: any) {
  if (!sessionId) return
  
  try {
    const supabase = createClient()
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
      // For insights generation, we might not have csvData yet - use mock data or fetch from user's uploads
      const mockInsights = [
        {
          id: 'insight-1',
          type: 'trend',
          title: 'Revenue Growth Acceleration',
          description: 'Monthly revenue has increased by 35% over the past quarter, with acceleration in the last two months.',
          confidence: 0.92,
          impact: 'high',
          evidence: ['Q1: $50K', 'Q2: $67K', 'Q3: $90K'],
          recommendations: [
            'Capitalize on growth momentum with increased marketing spend',
            'Scale customer success team to maintain quality',
            'Consider expanding to new market segments'
          ],
          businessImplication: 'Strong growth trajectory suggests successful product-market fit and potential for significant scale.'
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Customer Acquisition Cost Optimization',
          description: 'CAC has decreased by 22% while customer lifetime value increased, indicating improved efficiency.',
          confidence: 0.88,
          impact: 'medium',
          evidence: ['CAC: $150 → $117', 'LTV: $450 → $520'],
          recommendations: [
            'Double down on high-performing acquisition channels',
            'Implement referral program to leverage organic growth'
          ],
          businessImplication: 'Improved unit economics create foundation for sustainable profitable growth.'
        },
        {
          id: 'insight-3',
          type: 'risk',
          title: 'Concentration Risk in Top Customers',
          description: 'Top 3 customers represent 45% of total revenue, creating dependency risk.',
          confidence: 0.85,
          impact: 'medium',
          evidence: ['Customer A: 18%', 'Customer B: 15%', 'Customer C: 12%'],
          recommendations: [
            'Diversify customer base with targeted acquisition',
            'Strengthen relationships with key accounts',
            'Develop retention strategies for top customers'
          ],
          businessImplication: 'Customer concentration poses risk to revenue stability and requires active management.'
        }
      ]

      // Update progress to completed
      if (sessionId) {
        await updateProgress(sessionId, 'first_pass_analysis', 'completed', 100, { insights: mockInsights })
      }

      return NextResponse.json({ 
        success: true, 
        insights: mockInsights,
        userId: body.userId,
        analysisType: body.analysisType
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