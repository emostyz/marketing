import { NextRequest, NextResponse } from 'next/server';
// import { EventLogger } from '@/lib/services/event-logger';

export async function POST(request: NextRequest) {
  try {
    // Handle empty requests gracefully
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ success: true, message: 'Analytics disabled' });
    }

    const text = await request.text();
    if (!text) {
      return NextResponse.json({ success: true, message: 'Empty request, analytics disabled' });
    }

    const body = JSON.parse(text);
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