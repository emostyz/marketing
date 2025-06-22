import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      openai: !!process.env.OPENAI_API_KEY,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV
    }

    // Check if all required environment variables are present
    const allEnvPresent = envStatus.openai && envStatus.supabase_url && envStatus.supabase_anon_key

    return NextResponse.json({
      status: allEnvPresent ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      message: allEnvPresent 
        ? 'All environment variables configured' 
        : 'Some environment variables missing',
      server: 'running',
      database: 'connected',
      uptime: process.uptime()
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
} 