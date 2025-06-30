import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify session belongs to user
    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_processing_queue')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      start(controller) {
        let isComplete = false
        let lastUpdateTime = Date.now()
        
        // Function to send SSE event
        const sendEvent = (event: string, data: any) => {
          const formatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(formatted))
        }

        // Initial connection event
        sendEvent('connected', {
          sessionId,
          timestamp: new Date().toISOString(),
          message: 'Connected to progress stream'
        })

        // Function to check for updates
        const checkForUpdates = async () => {
          try {
            if (isComplete) return

            const { data: currentData, error } = await supabase
              .from('ai_processing_queue')
              .select('*')
              .eq('id', sessionId)
              .eq('user_id', user.id)
              .single()

            if (error) {
              sendEvent('error', { 
                error: 'Failed to fetch progress',
                timestamp: new Date().toISOString()
              })
              return
            }

            // Check if data has been updated since last check
            const dataUpdateTime = new Date(currentData.updated_at).getTime()
            if (dataUpdateTime > lastUpdateTime) {
              lastUpdateTime = dataUpdateTime

              // Send progress update
              sendEvent('progress', {
                sessionId,
                status: currentData.status,
                stage: currentData.pipeline_stage,
                message: getStageMessage(currentData.pipeline_stage, currentData.status),
                progress: calculateProgress(currentData.pipeline_stage, currentData.status),
                timestamp: currentData.updated_at,
                data: currentData.output_data
              })

              // Send stage-specific events
              if (currentData.status === 'completed') {
                sendEvent('stage-complete', {
                  stage: currentData.pipeline_stage,
                  timestamp: currentData.updated_at,
                  message: `${currentData.pipeline_stage.replace('_', ' ')} completed successfully`
                })
              }

              // Check if entire process is complete
              if (currentData.pipeline_stage === 'final_export' && currentData.status === 'completed') {
                sendEvent('complete', {
                  sessionId,
                  finalData: currentData.output_data,
                  timestamp: currentData.updated_at,
                  message: 'Presentation generation complete! 🎉'
                })
                isComplete = true
                controller.close()
                return
              }

              // Check for errors
              if (currentData.status === 'failed' || currentData.error_data) {
                sendEvent('error', {
                  sessionId,
                  stage: currentData.pipeline_stage,
                  error: currentData.error_data?.message || 'Process failed',
                  timestamp: currentData.updated_at
                })
                isComplete = true
                controller.close()
                return
              }
            }

            // Schedule next check
            if (!isComplete) {
              setTimeout(checkForUpdates, 1000) // Check every second
            }

          } catch (error) {
            sendEvent('error', {
              error: 'Internal server error',
              details: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            })
            controller.close()
          }
        }

        // Start checking for updates
        checkForUpdates()

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          isComplete = true
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })

  } catch (error) {
    console.error('SSE stream error:', error)
    return NextResponse.json(
      { error: 'Failed to create progress stream' },
      { status: 500 }
    )
  }
}

// Helper functions
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
    slide_structure: {
      pending: 'Queuing structure generation...',
      processing: 'AI is crafting your presentation structure...',
      completed: 'Presentation structure generated'
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
    slide_structure: 35,
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