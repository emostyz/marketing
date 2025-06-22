import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    const body = await request.json();
    const { newPlan, stripeSubscriptionId } = body;

    // Validate the new plan
    if (!['starter', 'professional', 'enterprise'].includes(newPlan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Failed to fetch updated profile' },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}