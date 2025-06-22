import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { TIER_LIMITS, VALID_USAGE_ACTIONS, type UsageAction, type TierName } from '@/lib/constants/tier-limits';

export async function POST(request: NextRequest) {
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

    const { action } = body;

    // Validate action parameter
    if (!action || !VALID_USAGE_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: ' + VALID_USAGE_ACTIONS.join(', ') },
        { status: 400 }
      );
    }

    // Check if user can perform the action based on their tier
    const { data: canPerform, error: checkError } = await supabase
      .rpc('check_tier_limit', {
        user_uuid: user.id,
        limit_type: action
      });

    if (checkError) {
      console.error('Usage check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check usage limits' },
        { status: 500 }
      );
    }

    // Get current subscription info for context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, presentations_used_this_month')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    const currentPlan = profile.subscription_plan as TierName;
    const limit = TIER_LIMITS[currentPlan][action as UsageAction];

    // Get current usage - safely handle different field names
    let currentUsage = 0;
    if (action === 'presentations') {
      currentUsage = profile.presentations_used_this_month || 0;
    } else {
      // For other usage types, we'd need to query the usage_tracking table
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select(action)
        .eq('user_id', user.id)
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .single();
      
      currentUsage = usageData?.[action] || 0;
    }

    return NextResponse.json({
      canPerform,
      currentUsage,
      limit: limit === -1 ? 'unlimited' : limit,
      plan: profile.subscription_plan,
      needsUpgrade: !canPerform
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { action } = body;

    // Validate action parameter
    if (!action || !VALID_USAGE_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: ' + VALID_USAGE_ACTIONS.join(', ') },
        { status: 400 }
      );
    }

    // Increment usage counter
    const { error: incrementError } = await supabase
      .rpc('increment_usage_counter', {
        user_uuid: user.id,
        counter_type: action
      });

    if (incrementError) {
      console.error('Usage increment error:', incrementError);
      return NextResponse.json(
        { error: 'Failed to update usage counter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usage updated successfully'
    });

  } catch (error) {
    console.error('Usage update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}