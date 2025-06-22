import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { VALID_USAGE_ACTIONS, type UsageAction } from '@/lib/constants/tier-limits';

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { action, reason } = body;

    // Validate action parameter
    if (!action || !VALID_USAGE_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: ' + VALID_USAGE_ACTIONS.join(', ') },
        { status: 400 }
      );
    }

    // Validate reason
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Reason for rollback is required' },
        { status: 400 }
      );
    }

    // Call the rollback function
    const { error: rollbackError } = await supabase
      .rpc('rollback_usage_counter', {
        user_uuid: user.id,
        counter_type: action,
        rollback_reason: reason
      });

    if (rollbackError) {
      console.error('Usage rollback error:', rollbackError);
      return NextResponse.json(
        { error: 'Failed to rollback usage counter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usage successfully rolled back',
      action,
      reason
    });

  } catch (error) {
    console.error('Usage rollback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}