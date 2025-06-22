import { handleSubscriptionChange, handleSubscriptionUpgrade } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
  }
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
  });

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    
    // Log webhook signature verification failure
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.from('system_events').insert({
      event_type: 'stripe_webhook_signature_failed',
      event_data: {
        error: err instanceof Error ? err.message : 'Unknown error',
        signature: signature ? 'present' : 'missing'
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      severity: 'critical'
    });

    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Log webhook event received
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.from('system_events').insert({
    event_type: 'stripe_webhook_received',
    event_data: {
      event_type: event.type,
      event_id: event.id,
      object_id: (event.data.object as any).id || 'unknown'
    },
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
    severity: 'info'
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Log checkout completion
        await supabase.from('payment_events').insert({
          event_type: 'checkout_completed',
          event_data: {
            session_id: session.id,
            customer_id: session.customer as string,
            amount_total: session.amount_total,
            currency: session.currency,
            plan: session.metadata?.plan,
            user_id: session.metadata?.supabase_user_id
          },
          stripe_event_id: event.id,
          created_at: new Date().toISOString()
        });

        if (session.metadata?.plan && session.metadata?.supabase_user_id) {
          await handleSubscriptionUpgrade(session.metadata.supabase_user_id, session.metadata.plan, session.subscription as string);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        // Log subscription update
        await supabase.from('payment_events').insert({
          event_type: 'subscription_updated',
          event_data: {
            subscription_id: updatedSubscription.id,
            customer_id: updatedSubscription.customer as string,
            status: updatedSubscription.status,
            current_period_end: (updatedSubscription as any).current_period_end ? new Date((updatedSubscription as any).current_period_end * 1000).toISOString() : null,
            plan_id: updatedSubscription.items.data[0]?.price.id
          },
          stripe_event_id: event.id,
          created_at: new Date().toISOString()
        });

        await handleSubscriptionChange(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Log subscription deletion
        await supabase.from('payment_events').insert({
          event_type: 'subscription_deleted',
          event_data: {
            subscription_id: deletedSubscription.id,
            customer_id: deletedSubscription.customer as string,
            status: deletedSubscription.status,
            canceled_at: deletedSubscription.canceled_at ? new Date(deletedSubscription.canceled_at * 1000).toISOString() : null
          },
          stripe_event_id: event.id,
          created_at: new Date().toISOString()
        });

        await handleSubscriptionChange(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        // Log successful payment
        await supabase.from('payment_events').insert({
          event_type: 'payment_succeeded',
          event_data: {
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            subscription_id: (invoice as any).subscription || null,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency
          },
          stripe_event_id: event.id,
          created_at: new Date().toISOString()
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        // Log failed payment
        await supabase.from('payment_events').insert({
          event_type: 'payment_failed',
          event_data: {
            invoice_id: failedInvoice.id,
            customer_id: failedInvoice.customer as string,
            subscription_id: (failedInvoice as any).subscription || null,
            amount_due: failedInvoice.amount_due,
            currency: failedInvoice.currency,
            attempt_count: failedInvoice.attempt_count
          },
          stripe_event_id: event.id,
          created_at: new Date().toISOString()
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        
        // Log unhandled event
        await supabase.from('system_events').insert({
          event_type: 'stripe_webhook_unhandled',
          event_data: {
            event_type: event.type,
            event_id: event.id
          },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          severity: 'warning'
        });
    }

    // Log webhook processing success
    await supabase.from('system_events').insert({
      event_type: 'stripe_webhook_processed',
      event_data: {
        event_type: event.type,
        event_id: event.id
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      severity: 'info'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log webhook processing error
    await supabase.from('system_events').insert({
      event_type: 'stripe_webhook_processing_error',
      event_data: {
        event_type: event.type,
        event_id: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      severity: 'critical'
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
