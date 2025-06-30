/**
 * Server-Sent Events (SSE) endpoint for real-time deck generation progress
 * Provides live updates during the AI pipeline execution
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { getLatestProgress } from '@/services/aiAgents/bridge'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Get deck ID from query params
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    
    if (!deckId) {
      return NextResponse.json({ error: 'Missing deckId parameter' }, { status: 400 })
    }
    
    console.log(`📡 Starting SSE stream for deck ${deckId} (user: ${user.id.slice(0, 8)})`)
    
    // Create SSE response
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ 
          type: 'connected', 
          message: 'Progress stream connected',
          timestamp: new Date().toISOString()
        })}\n\n`)
        
        // Set up polling for progress updates
        const pollProgress = async () => {
          try {
            const progress = await getLatestProgress(deckId)
            
            if (progress) {
              const progressData = {
                type: 'progress',
                step: progress.step,
                message: progress.message,
                metadata: progress.metadata,
                timestamp: new Date().toISOString()
              }
              
              controller.enqueue(`data: ${JSON.stringify(progressData)}\n\n`)
              
              // If done or error, close the stream
              if (progress.step === 'done' || progress.step === 'error') {
                console.log(`📡 Closing SSE stream for ${deckId}: ${progress.step}`)
                controller.close()
                return
              }
            }
            
            // Poll every 2 seconds
            setTimeout(pollProgress, 2000)
            
          } catch (error) {
            console.error(`SSE polling error for ${deckId}:`, error)
            controller.enqueue(`data: ${JSON.stringify({ 
              type: 'error', 
              message: 'Progress polling failed',
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.close()
          }
        }
        
        // Start polling
        pollProgress()
        
        // Set timeout to prevent infinite streams
        setTimeout(() => {
          if (!controller.closed) {
            controller.enqueue(`data: ${JSON.stringify({ 
              type: 'timeout', 
              message: 'Stream timeout after 5 minutes',
              timestamp: new Date().toISOString()
            })}\n\n`)
            controller.close()
          }
        }, 300000) // 5 minutes timeout
      },
      
      cancel() {
        console.log(`📡 SSE stream cancelled for deck ${deckId}`)
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
    
  } catch (error) {
    console.error('SSE stream setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to setup progress stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Simple GET endpoint for checking progress without streaming
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { deckId } = await request.json()
    
    if (!deckId) {
      return NextResponse.json({ error: 'Missing deckId' }, { status: 400 })
    }
    
    const progress = await getLatestProgress(deckId)
    
    return NextResponse.json({
      success: true,
      progress: progress || { step: 'pending', message: 'No progress data found' }
    })
    
  } catch (error) {
    console.error('Progress check error:', error)
    return NextResponse.json({ 
      error: 'Failed to get progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}