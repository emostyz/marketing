import { NextRequest, NextResponse } from 'next/server';
import { EventLogger } from '@/lib/services/event-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_data, element_id, path, user_id, timestamp } = body;

    const clientInfo = EventLogger.getClientInfo(request);

    // Log user interaction event
    await EventLogger.logUserEvent(event_type, {
      ...event_data,
      element_id: element_id || null,
      path: path || 'unknown',
      timestamp
    }, {
      ...clientInfo,
      user_id: user_id || null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User interaction logging error:', error);
    
    // Log system error
    await EventLogger.logSystemEvent(
      'user_interaction_logging_error',
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error',
      EventLogger.getClientInfo(request)
    );

    return NextResponse.json(
      { error: 'Failed to log user interaction' },
      { status: 500 }
    );
  }
} 