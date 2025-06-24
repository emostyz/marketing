import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
// import { EventLogger } from '@/lib/services/event-logger'

export async function POST(request: NextRequest) {
  try {
    let pageUrl = null, pageTitle = null;
    try {
      const body = await request.text();
      if (body) {
        const json = JSON.parse(body);
        pageUrl = json.pageUrl;
        pageTitle = json.pageTitle;
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
    }
    if (!pageUrl) {
      return NextResponse.json({ error: 'Missing pageUrl' }, { status: 400 });
    }

    // Analytics disabled - EventLogger removed
    console.log('Page view event (disabled):', { pageUrl, pageTitle })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating page view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 