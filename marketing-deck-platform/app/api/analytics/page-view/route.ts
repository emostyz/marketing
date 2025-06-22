import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { EventLogger } from '@/lib/services/event-logger'

export async function POST(request: NextRequest) {
  try {
    const { pageUrl, pageTitle } = await request.json()
    
    if (!pageUrl) {
      return NextResponse.json(
        { error: 'Page URL is required' },
        { status: 400 }
      )
    }

    // Get client info
    const clientInfo = EventLogger.getClientInfo(request)
    
    // Log the page view
    await EventLogger.logPageView(pageUrl, pageTitle, clientInfo)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating page view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 