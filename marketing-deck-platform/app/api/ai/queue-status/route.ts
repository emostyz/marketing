import { NextRequest, NextResponse } from 'next/server'
import { AsyncOrchestrator } from '@/lib/queue/async-orchestrator'

export async function GET(request: NextRequest) {
  try {
    // Get queue status
    const queueStatus = await AsyncOrchestrator.getQueueStatus()
    
    // Calculate health metrics
    const totalJobs = queueStatus.waiting + queueStatus.active + queueStatus.completed + queueStatus.failed
    const errorRate = totalJobs > 0 ? (queueStatus.failed / totalJobs) * 100 : 0
    const isHealthy = queueStatus.active < 10 && errorRate < 20 // Configurable thresholds
    
    const response = {
      status: 'ok',
      healthy: isHealthy,
      queue: queueStatus.queue,
      jobs: {
        waiting: queueStatus.waiting,
        active: queueStatus.active,
        completed: queueStatus.completed,
        failed: queueStatus.failed,
        total: totalJobs
      },
      metrics: {
        errorRate: Math.round(errorRate * 100) / 100,
        activeJobs: queueStatus.active,
        queueBacklog: queueStatus.waiting
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Queue status check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        healthy: false,
        error: 'Failed to check queue status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Optional: Add authentication for production
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }
    
    const jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
    
    return NextResponse.json({
      jobId,
      ...jobStatus,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Job status check failed:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to check job status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}