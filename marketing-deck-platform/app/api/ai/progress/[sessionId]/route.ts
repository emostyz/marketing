import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

interface ProgressSession {
  id: string
  user_id: string
  session_type: 'upload' | 'insights' | 'structure' | 'generation'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  stage: string
  message: string
  progress: number
  data?: any
  error?: string
  created_at: string
  updated_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if session exists in processing queue
    const { data: queueData, error: queueError } = await supabase
      .from('ai_processing_queue')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (queueError || !queueData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Format response
    const response = {
      sessionId,
      status: queueData.status,
      stage: queueData.pipeline_stage,
      message: getStageMessage(queueData.pipeline_stage, queueData.status),
      progress: calculateProgress(queueData.pipeline_stage, queueData.status),
      timestamp: queueData.updated_at,
      data: queueData.output_data,
      error: queueData.error_data?.message
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    const body = await request.json()

    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update progress
    const { error: updateError } = await supabase
      .from('ai_processing_queue')
      .update({
        status: body.status,
        pipeline_stage: body.stage,
        output_data: body.data,
        error_data: body.error ? { message: body.error } : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

function getStageMessage(stage: string, status: string): string {
  const messages = {
    data_intake: {
      pending: 'Preparing to process your data...',
      processing: 'Reading and validating your uploaded file...',
      completed: 'Data successfully processed and validated'
    },
    first_pass_analysis: {
      pending: 'Queuing data analysis...',
      processing: 'AI is analyzing your data for patterns and insights...',
      completed: 'Initial analysis complete - insights discovered'
    },
    user_review: {
      pending: 'Waiting for your feedback on insights...',
      processing: 'Processing your feedback...',
      completed: 'Feedback received and processed'
    },
    feedback_processing: {
      pending: 'Preparing to refine analysis...',
      processing: 'AI is incorporating your feedback to refine insights...',
      completed: 'Refined analysis complete'
    },
    slide_structure: {
      pending: 'Queuing structure generation...',
      processing: 'AI is crafting your presentation structure...',
      completed: 'Presentation structure generated'
    },
    structure_editing: {
      pending: 'Ready for structure customization...',
      processing: 'Applying your structure modifications...',
      completed: 'Structure finalized'
    },
    content_generation: {
      pending: 'Preparing content generation...',
      processing: 'AI is creating slides, charts, and content...',
      completed: 'Content generation complete'
    },
    chart_generation: {
      pending: 'Queuing chart creation...',
      processing: 'Creating beautiful charts and visualizations...',
      completed: 'Charts and visualizations ready'
    },
    qa_validation: {
      pending: 'Preparing quality assurance...',
      processing: 'AI is reviewing and optimizing your presentation...',
      completed: 'Quality assurance passed'
    },
    final_export: {
      pending: 'Preparing final assembly...',
      processing: 'Assembling your final presentation...',
      completed: 'Presentation ready! 🎉'
    }
  }

  return messages[stage]?.[status] || `${stage.replace('_', ' ')} - ${status}`
}

function calculateProgress(stage: string, status: string): number {
  const stageWeights = {
    data_intake: 5,
    first_pass_analysis: 15,
    user_review: 20,
    feedback_processing: 25,
    slide_structure: 35,
    structure_editing: 40,
    content_generation: 70,
    chart_generation: 85,
    qa_validation: 95,
    final_export: 100
  }

  const baseProgress = stageWeights[stage] || 0
  
  if (status === 'completed') {
    return baseProgress
  } else if (status === 'processing') {
    return Math.max(baseProgress - 5, 0)
  } else {
    return Math.max(baseProgress - 10, 0)
  }
}