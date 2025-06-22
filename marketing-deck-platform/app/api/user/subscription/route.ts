import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Log unauthorized access attempt
      await supabase.from('user_events').insert({
        event_type: 'subscription_fetch_unauthorized',
        event_data: {
          error: userError?.message || 'No user found'
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log subscription fetch attempt
    await supabase.from('user_events').insert({
      event_type: 'subscription_fetched',
      event_data: {
        user_id: user.id
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      user_id: user.id
    })

    // Get user's subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        subscription_plan,
        presentations_used_this_month,
        monthly_reset_date,
        stripe_customer_id
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      
      // Log profile fetch error
      await supabase.from('user_events').insert({
        event_type: 'subscription_fetch_failed',
        event_data: {
          error: profileError.message
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        user_id: user.id
      })

      return NextResponse.json(
        { error: 'Failed to fetch subscription info' },
        { status: 500 }
      );
    }

    // Get usage tracking for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single();

    // Define tier limits based on pricing strategy
    const tierLimits = {
      starter: {
        presentations: 5,
        teamMembers: 1,
        features: ['basic_ai', 'standard_templates', 'pdf_export', 'email_support']
      },
      professional: {
        presentations: 25,
        teamMembers: 5,
        features: ['advanced_ai', 'premium_templates', 'powerpoint_export', 'priority_support', 'custom_branding', 'api_access']
      },
      enterprise: {
        presentations: -1, // unlimited
        teamMembers: -1,
        features: ['custom_ai', 'custom_templates', 'all_exports', 'phone_support', 'sso', 'dedicated_manager', 'sla']
      }
    };

    const currentPlan = profile.subscription_plan as keyof typeof tierLimits;
    const limits = tierLimits[currentPlan];

    return NextResponse.json({
      subscription: {
        plan: profile.subscription_plan,
        presentationsUsed: profile.presentations_used_this_month,
        presentationLimit: limits.presentations,
        monthlyResetDate: profile.monthly_reset_date,
        stripeCustomerId: profile.stripe_customer_id,
        limits,
        usage: usage || {
          presentations_created: 0,
          data_uploads: 0,
          ai_analyses: 0,
          exports_generated: 0,
          storage_used_mb: 0
        }
      }
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.from('system_events').insert({
      event_type: 'subscription_fetch_system_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      severity: 'error'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Log unauthorized access attempt
      await supabase.from('user_events').insert({
        event_type: 'subscription_update_unauthorized',
        event_data: {
          error: userError?.message || 'No user found'
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      })

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPlan, stripeSubscriptionId } = body;

    // Get current subscription for comparison
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    // Validate the new plan
    if (!['starter', 'professional', 'enterprise'].includes(newPlan)) {
      // Log invalid plan attempt
      await supabase.from('user_events').insert({
        event_type: 'subscription_update_invalid_plan',
        event_data: {
          attempted_plan: newPlan,
          current_plan: currentProfile?.subscription_plan
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        user_id: user.id
      })

      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Log subscription update attempt
    await supabase.from('user_events').insert({
      event_type: 'subscription_update_attempted',
      event_data: {
        current_plan: currentProfile?.subscription_plan,
        new_plan: newPlan,
        stripe_subscription_id: stripeSubscriptionId
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      user_id: user.id
    })

    // Call the database function to upgrade subscription
    const { error: upgradeError } = await supabase
      .rpc('upgrade_user_subscription', {
        user_uuid: user.id,
        new_plan: newPlan,
        stripe_sub_id: stripeSubscriptionId,
        reason: 'User upgrade request'
      });

    if (upgradeError) {
      console.error('Subscription upgrade error:', upgradeError);
      
      // Log upgrade failure
      await supabase.from('user_events').insert({
        event_type: 'subscription_update_failed',
        event_data: {
          error: upgradeError.message,
          current_plan: currentProfile?.subscription_plan,
          attempted_plan: newPlan
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        user_id: user.id
      })

      return NextResponse.json(
        { error: 'Failed to upgrade subscription' },
        { status: 500 }
      );
    }

    // Get updated subscription info
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('subscription_plan, presentations_used_this_month, monthly_reset_date')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Updated profile fetch error:', fetchError);
      
      // Log fetch error
      await supabase.from('user_events').insert({
        event_type: 'subscription_update_fetch_failed',
        event_data: {
          error: fetchError.message
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        user_id: user.id
      })

      return NextResponse.json(
        { error: 'Failed to fetch updated profile' },
        { status: 500 }
      );
    }

    // Log successful subscription update
    await supabase.from('user_events').insert({
      event_type: 'subscription_updated',
      event_data: {
        previous_plan: currentProfile?.subscription_plan,
        new_plan: updatedProfile.subscription_plan,
        stripe_subscription_id: stripeSubscriptionId
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      user_id: user.id
    })

    // Log subscription change event
    await supabase.from('subscription_events').insert({
      user_id: user.id,
      event_type: 'plan_changed',
      event_data: {
        previous_plan: currentProfile?.subscription_plan,
        new_plan: updatedProfile.subscription_plan,
        stripe_subscription_id: stripeSubscriptionId,
        reason: 'User upgrade request'
      },
      ip_address: clientIP,
      user_agent: userAgent,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: {
        plan: updatedProfile.subscription_plan,
        presentationsUsed: updatedProfile.presentations_used_this_month,
        monthlyResetDate: updatedProfile.monthly_reset_date
      }
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.from('system_events').insert({
      event_type: 'subscription_update_system_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      severity: 'error'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}