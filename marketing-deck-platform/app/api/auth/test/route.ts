import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { EventLogger } from '@/lib/services/event-logger'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Auth test endpoint is working',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle empty request body
    let body = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (parseError) {
      // If JSON parsing fails, use empty object
      body = {}
    }
    
    const { demo = false } = body as { demo?: boolean }
    
    if (!demo) {
      return NextResponse.json(
        { error: 'Demo mode required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Get client info
    const clientInfo = EventLogger.getClientInfo(request)
    
    // Log the demo request
    await EventLogger.logSystemEvent(
      'demo_requested',
      { demo: true },
      'info',
      clientInfo
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Demo mode activated',
      demo: true 
    })
  } catch (error) {
    console.error('Demo route error:', error)
    
    // Log the error
    try {
      const clientInfo = EventLogger.getClientInfo(request)
      await EventLogger.logSystemEvent(
        'demo_error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error',
        clientInfo
      )
    } catch (logError) {
      console.error('Error logging system event:', logError)
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 