import { NextRequest, NextResponse } from 'next/server'
import { AsyncOrchestrator } from '@/lib/queue/async-orchestrator'
import { z } from 'zod'

const GenerateRequestSchema = z.object({
  deckId: z.string().uuid(),
  userId: z.string().uuid(),
  context: z.object({
    businessContext: z.string().optional(),
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    presentationGoal: z.string().optional(),
    decisionMakers: z.array(z.string()).optional(),
    urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    presentationStyle: z.string().optional()
  }),
  priority: z.number().min(1).max(10).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = GenerateRequestSchema.parse(body)
    
    // Enqueue the presentation generation job
    const result = await AsyncOrchestrator.enqueuePresentationGeneration({
      deckId: validatedData.deckId,
      userId: validatedData.userId,
      context: validatedData.context,
      priority: validatedData.priority || 1
    })
    
    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      deckId: result.deckId,
      message: 'Presentation generation job enqueued successfully',
      estimatedTime: '2-5 minutes',
      statusUrl: `/api/ai/queue-status`,
      timestamp: new Date().toISOString()
    }, { status: 202 }) // 202 Accepted
    
  } catch (error) {
    console.error('Failed to enqueue presentation generation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to enqueue presentation generation'
    }, { status: 500 })
  }
}

// GET endpoint to check job status by job ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const jobId = url.searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({
        error: 'Job ID is required'
      }, { status: 400 })
    }
    
    const jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
    
    return NextResponse.json({
      jobId,
      ...jobStatus,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Failed to get job status:', error)
    
    return NextResponse.json({
      error: 'Failed to get job status'
    }, { status: 500 })
  }
}