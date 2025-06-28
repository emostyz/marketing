import { NextRequest, NextResponse } from 'next/server'
import { runPipeline, getPipelineStatus, resumePipeline } from '@/lib/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.deckId || !body.csvData) {
      return NextResponse.json(
        { error: 'deckId and csvData are required' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(body.csvData) || body.csvData.length === 0) {
      return NextResponse.json(
        { error: 'csvData must be a non-empty array' },
        { status: 400 }
      )
    }
    
    console.log(`🎯 Starting AI pipeline for deck: ${body.deckId}`)
    console.log(`📊 Processing ${body.csvData.length} rows of data`)
    
    // Run the complete AI pipeline
    const result = await runPipeline({
      deckId: body.deckId,
      csvData: body.csvData,
      context: body.context || {}
    })
    
    if (result.status === 'success') {
      return NextResponse.json({
        status: 'ok',
        finalDeckJson: result.finalDeckJson,
        metadata: result.metadata,
        pipeline: {
          steps: result.steps,
          duration: result.metadata.totalDuration,
          qualityScore: result.metadata.qualityScore
        }
      })
    } else {
      return NextResponse.json({
        status: 'failed',
        error: 'Pipeline execution failed',
        steps: result.steps,
        metadata: result.metadata
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Pipeline API error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: 'Pipeline execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    
    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId parameter is required' },
        { status: 400 }
      )
    }
    
    // Get pipeline status
    const status = await getPipelineStatus(deckId)
    
    if (!status) {
      return NextResponse.json(
        { error: 'Pipeline status not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      deckId,
      steps: status,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Pipeline status API error:', error)
    
    return NextResponse.json({
      error: 'Failed to get pipeline status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields for resume
    if (!body.deckId || !body.csvData) {
      return NextResponse.json(
        { error: 'deckId and csvData are required for resume' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 Resuming AI pipeline for deck: ${body.deckId}`)
    
    // Resume the pipeline
    const result = await resumePipeline(body.deckId, {
      deckId: body.deckId,
      csvData: body.csvData,
      context: body.context || {}
    })
    
    if (result.status === 'success') {
      return NextResponse.json({
        status: 'ok',
        finalDeckJson: result.finalDeckJson,
        metadata: result.metadata,
        resumed: true
      })
    } else {
      return NextResponse.json({
        status: 'failed',
        error: 'Pipeline resume failed',
        steps: result.steps,
        metadata: result.metadata
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Pipeline resume API error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: 'Pipeline resume failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}