import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Create a test SSE stream to verify the implementation works
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      let eventCount = 0
      let isComplete = false

      // Function to send SSE event
      const sendEvent = (event: string, data: any) => {
        const formatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(formatted))
      }

      // Send initial connection event
      sendEvent('connected', {
        message: 'SSE stream test started',
        timestamp: new Date().toISOString()
      })

      // Simulate progress updates
      const simulateProgress = () => {
        if (isComplete) return

        eventCount++
        
        // Simulate different types of events
        const testStages = [
          { stage: 'data_intake', status: 'processing', progress: 5 },
          { stage: 'data_intake', status: 'completed', progress: 10 },
          { stage: 'first_pass_analysis', status: 'processing', progress: 20 },
          { stage: 'first_pass_analysis', status: 'completed', progress: 30 },
          { stage: 'slide_structure', status: 'processing', progress: 50 },
          { stage: 'slide_structure', status: 'completed', progress: 60 },
          { stage: 'content_generation', status: 'processing', progress: 80 },
          { stage: 'content_generation', status: 'completed', progress: 90 },
          { stage: 'final_export', status: 'completed', progress: 100 }
        ]

        if (eventCount <= testStages.length) {
          const currentStage = testStages[eventCount - 1]
          
          sendEvent('progress', {
            sessionId: 'test-session',
            stage: currentStage.stage,
            status: currentStage.status,
            progress: currentStage.progress,
            message: `${currentStage.stage.replace('_', ' ')} - ${currentStage.status}`,
            timestamp: new Date().toISOString(),
            eventNumber: eventCount
          })

          if (currentStage.status === 'completed') {
            sendEvent('stage-complete', {
              stage: currentStage.stage,
              timestamp: new Date().toISOString()
            })
          }

          if (eventCount === testStages.length) {
            sendEvent('complete', {
              message: 'SSE stream test completed successfully! 🎉',
              totalEvents: eventCount,
              timestamp: new Date().toISOString()
            })
            isComplete = true
            controller.close()
            return
          }

          // Schedule next update
          setTimeout(simulateProgress, 1000) // 1 second intervals
        }
      }

      // Start the simulation
      setTimeout(simulateProgress, 500) // Start after 500ms

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
}