import { NextRequest, NextResponse } from 'next/server';
// import { EventLogger } from '@/lib/services/event-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_data, element_id, path, user_id, timestamp } = body;

    // Analytics disabled - EventLogger removed
    console.log('User interaction event (disabled):', { event_type, element_id, path, user_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User interaction logging error:', error);

    return NextResponse.json(
      { error: 'Failed to log user interaction' },
      { status: 500 }
    );
  }
} 