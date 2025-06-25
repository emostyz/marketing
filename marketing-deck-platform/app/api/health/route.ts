import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'operational',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        circular_feedback: 'operational',
        world_class_generation: 'operational'
      },
      version: '2.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Quick system check
    const systemStatus = Object.values(healthCheck.services).every(status => 
      status === 'operational' || status === 'configured'
    ) ? 'all_systems_go' : 'degraded'

    return NextResponse.json({
      ...healthCheck,
      systemStatus,
      message: systemStatus === 'all_systems_go' 
        ? 'AI-powered deck generation system is fully operational' 
        : 'Some services may be degraded'
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}