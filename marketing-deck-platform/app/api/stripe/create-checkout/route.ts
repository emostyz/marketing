import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

// Validate required environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PROFESSIONAL_PRICE_ID: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  }
}

// Initialize Stripe with error handling
let stripe: Stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  throw error;
}

const PRICE_IDS = {
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
} as const;

const VALID_PLANS = ['professional', 'enterprise'] as const;
type ValidPlan = typeof VALID_PLANS[number];

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

    const { plan } = body;

    // Validate plan parameter
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: ' + VALID_PLANS.join(', ') },
        { status: 400 }
      );
    }

    // Check if price ID is configured
    const priceId = PRICE_IDS[plan as ValidPlan];
    if (!priceId) {
      console.error(`Price ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: 'Plan configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Get user profile for customer info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    let customerId = profile.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name || '',
        metadata: {
          supabase_user_id: user.id
        }
      });
      
      customerId = customer.id;
      
      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          plan,
          supabase_user_id: user.id
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?upgrade=success&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?upgrade=cancelled`,
      metadata: {
        plan,
        supabase_user_id: user.id
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}