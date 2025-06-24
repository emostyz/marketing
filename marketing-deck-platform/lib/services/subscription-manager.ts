/**
 * Comprehensive Subscription Management System
 * Handles upgrades, downgrades, pausing, and plan switching
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: {
    presentations: number;
    teamMembers: number;
    storage: number; // in GB
    exports: number;
    aiModels: string[];
    priority: 'standard' | 'high' | 'enterprise';
    customBranding: boolean;
    apiAccess: boolean;
    offlineLLM: boolean;
    analytics: boolean;
    ssoIntegration: boolean;
  };
  stripeProductId: string;
  stripePriceId: string;
}

export interface SubscriptionChange {
  fromPlan: string;
  toPlan: string;
  changeType: 'upgrade' | 'downgrade' | 'switch';
  effectiveDate: Date;
  prorationAmount: number;
  reason?: string;
}

export interface PauseSettings {
  pauseDate: Date;
  resumeDate?: Date;
  maxPauseDuration: number; // days
  retainData: boolean;
  pauseReason: string;
}

export class SubscriptionManager {
  private supabase: ReturnType<typeof createClient>;
  private stripe: Stripe;

  // Available subscription plans
  private static readonly SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
    'starter': {
      id: 'starter',
      name: 'starter',
      displayName: 'Starter',
      price: 29,
      billingCycle: 'monthly',
      features: {
        presentations: 10,
        teamMembers: 1,
        storage: 5,
        exports: 50,
        aiModels: ['gpt-3.5-turbo'],
        priority: 'standard',
        customBranding: false,
        apiAccess: false,
        offlineLLM: false,
        analytics: false,
        ssoIntegration: false
      },
      stripeProductId: 'prod_starter',
      stripePriceId: 'price_starter_monthly'
    },
    'professional': {
      id: 'professional',
      name: 'professional',
      displayName: 'Professional',
      price: 79,
      billingCycle: 'monthly',
      features: {
        presentations: 50,
        teamMembers: 5,
        storage: 50,
        exports: 200,
        aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'],
        priority: 'high',
        customBranding: true,
        apiAccess: true,
        offlineLLM: false,
        analytics: true,
        ssoIntegration: false
      },
      stripeProductId: 'prod_professional',
      stripePriceId: 'price_professional_monthly'
    },
    'enterprise': {
      id: 'enterprise',
      name: 'enterprise',
      displayName: 'Enterprise',
      price: 299,
      billingCycle: 'monthly',
      features: {
        presentations: -1, // unlimited
        teamMembers: -1, // unlimited
        storage: 500,
        exports: -1, // unlimited
        aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet', 'claude-3-opus', 'local-llm'],
        priority: 'enterprise',
        customBranding: true,
        apiAccess: true,
        offlineLLM: true,
        analytics: true,
        ssoIntegration: true
      },
      stripeProductId: 'prod_enterprise',
      stripePriceId: 'price_enterprise_monthly'
    }
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  /**
   * Get all available subscription plans
   */
  getAvailablePlans(): SubscriptionPlan[] {
    return Object.values(SubscriptionManager.SUBSCRIPTION_PLANS);
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | null {
    return SubscriptionManager.SUBSCRIPTION_PLANS[planId] || null;
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(
    userId: string, 
    newPlanId: string, 
    immediateUpgrade: boolean = true
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      // Get current subscription
      const { data: currentSub, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError) {
        return { success: false, error: 'No active subscription found' };
      }

      const currentPlan = this.getPlan(currentSub.plan);
      const newPlan = this.getPlan(newPlanId);

      if (!currentPlan || !newPlan) {
        return { success: false, error: 'Invalid plan configuration' };
      }

      // Validate it's actually an upgrade
      if (newPlan.price <= currentPlan.price) {
        return { success: false, error: 'New plan must be higher tier than current plan' };
      }

      // Calculate proration
      const prorationAmount = await this.calculateProration(
        currentSub.stripe_subscription_id as string,
        newPlan.stripePriceId
      );

      // Update subscription in Stripe
      const stripeSubscription = await this.stripe.subscriptions.update(
        currentSub.stripe_subscription_id as string,
        {
          items: [{
            id: currentSub.stripe_subscription_item_id as string,
            price: newPlan.stripePriceId
          }],
          proration_behavior: immediateUpgrade ? 'always_invoice' : 'none',
          billing_cycle_anchor: immediateUpgrade ? undefined : 'unchanged'
        }
      );

      // Update in database
      const { error: updateError } = await this.supabase
        .from('user_subscriptions')
        .update({
          plan: newPlanId,
          stripe_price_id: newPlan.stripePriceId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      // Log the change
      await this.logSubscriptionChange({
        fromPlan: currentPlan.id,
        toPlan: newPlan.id,
        changeType: 'upgrade',
        effectiveDate: new Date(),
        prorationAmount,
        reason: 'User initiated upgrade'
      }, userId);

      // Update user limits
      await this.updateUserLimits(userId, newPlan);

      return { 
        success: true, 
        subscriptionId: stripeSubscription.id 
      };

    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Downgrade user subscription
   */
  async downgradeSubscription(
    userId: string, 
    newPlanId: string,
    effectiveDate: 'immediate' | 'end_of_period' = 'end_of_period'
  ): Promise<{ success: boolean; effectiveDate?: Date; error?: string }> {
    try {
      // Get current subscription
      const { data: currentSub, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError) {
        return { success: false, error: 'No active subscription found' };
      }

      const currentPlan = this.getPlan(currentSub.plan);
      const newPlan = this.getPlan(newPlanId);

      if (!currentPlan || !newPlan) {
        return { success: false, error: 'Invalid plan configuration' };
      }

      // Validate it's actually a downgrade
      if (newPlan.price >= currentPlan.price) {
        return { success: false, error: 'New plan must be lower tier than current plan' };
      }

      // Check if downgrade is safe (user within new limits)
      const limitsCheck = await this.validateDowngradeLimits(userId, newPlan);
      if (!limitsCheck.canDowngrade) {
        return { 
          success: false, 
          error: `Cannot downgrade: ${limitsCheck.violations.join(', ')}` 
        };
      }

      let actualEffectiveDate: Date;

      if (effectiveDate === 'immediate') {
        // Immediate downgrade with proration credit
        const stripeSubscription = await this.stripe.subscriptions.update(
          currentSub.stripe_subscription_id as string,
          {
            items: [{
              id: currentSub.stripe_subscription_item_id as string,
              price: newPlan.stripePriceId
            }],
            proration_behavior: 'always_invoice'
          }
        );

        actualEffectiveDate = new Date();

        // Update in database immediately
        await this.supabase
          .from('user_subscriptions')
          .update({
            plan: newPlanId,
            stripe_price_id: newPlan.stripePriceId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Update user limits immediately
        await this.updateUserLimits(userId, newPlan);

      } else {
        // Schedule downgrade for end of billing period
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          currentSub.stripe_subscription_id as string
        );

        actualEffectiveDate = new Date(stripeSubscription.current_period_end * 1000);

        // Schedule the change
        await this.stripe.subscriptions.update(
          currentSub.stripe_subscription_id as string,
          {
            items: [{
              id: currentSub.stripe_subscription_item_id as string,
              price: newPlan.stripePriceId
            }],
            proration_behavior: 'none',
            billing_cycle_anchor: 'unchanged'
          }
        );

        // Create scheduled change record
        await this.supabase
          .from('scheduled_subscription_changes')
          .insert({
            user_id: userId,
            current_plan: currentPlan.id,
            new_plan: newPlan.id,
            change_type: 'downgrade',
            scheduled_date: actualEffectiveDate.toISOString(),
            created_at: new Date().toISOString()
          });
      }

      // Log the change
      await this.logSubscriptionChange({
        fromPlan: currentPlan.id,
        toPlan: newPlan.id,
        changeType: 'downgrade',
        effectiveDate: actualEffectiveDate,
        prorationAmount: 0,
        reason: `User initiated downgrade (${effectiveDate})`
      }, userId);

      return { 
        success: true, 
        effectiveDate: actualEffectiveDate 
      };

    } catch (error) {
      console.error('Downgrade subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(
    userId: string, 
    pauseSettings: PauseSettings
  ): Promise<{ success: boolean; resumeDate?: Date; error?: string }> {
    try {
      // Get current subscription
      const { data: currentSub, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError) {
        return { success: false, error: 'No active subscription found' };
      }

      // Validate pause duration
      const maxPauseDays = 90; // Maximum 90 days pause
      if (pauseSettings.maxPauseDuration > maxPauseDays) {
        return { success: false, error: `Maximum pause duration is ${maxPauseDays} days` };
      }

      // Calculate resume date if not provided
      const resumeDate = pauseSettings.resumeDate || 
        new Date(pauseSettings.pauseDate.getTime() + (pauseSettings.maxPauseDuration * 24 * 60 * 60 * 1000));

      // Pause subscription in Stripe
      await this.stripe.subscriptions.update(
        currentSub.stripe_subscription_id as string,
        {
          pause_collection: {
            behavior: 'void',
            resumes_at: Math.floor(resumeDate.getTime() / 1000)
          }
        }
      );

      // Update in database
      await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'paused',
          paused_at: pauseSettings.pauseDate.toISOString(),
          scheduled_resume_at: resumeDate.toISOString(),
          pause_reason: pauseSettings.pauseReason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Log the pause
      await this.supabase
        .from('subscription_events')
        .insert({
          user_id: userId,
          event_type: 'subscription_paused',
          event_data: {
            pause_date: pauseSettings.pauseDate,
            resume_date: resumeDate,
            reason: pauseSettings.pauseReason,
            retain_data: pauseSettings.retainData
          },
          created_at: new Date().toISOString()
        });

      // Optionally suspend user access but retain data
      if (!pauseSettings.retainData) {
        await this.suspendUserAccess(userId, 'subscription_paused');
      }

      return { 
        success: true, 
        resumeDate 
      };

    } catch (error) {
      console.error('Pause subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get paused subscription
      const { data: pausedSub, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'paused')
        .single();

      if (subError) {
        return { success: false, error: 'No paused subscription found' };
      }

      // Resume subscription in Stripe
      await this.stripe.subscriptions.update(
        pausedSub.stripe_subscription_id as string,
        {
          pause_collection: null
        }
      );

      // Update in database
      await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          paused_at: null,
          scheduled_resume_at: null,
          pause_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Restore user access
      await this.restoreUserAccess(userId);

      // Log the resume
      await this.supabase
        .from('subscription_events')
        .insert({
          user_id: userId,
          event_type: 'subscription_resumed',
          event_data: {
            resumed_at: new Date(),
            was_scheduled: !!pausedSub.scheduled_resume_at
          },
          created_at: new Date().toISOString()
        });

      return { success: true };

    } catch (error) {
      console.error('Resume subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string, 
    cancelAt: 'immediately' | 'end_of_period' = 'end_of_period',
    reason?: string
  ): Promise<{ success: boolean; cancelDate?: Date; error?: string }> {
    try {
      // Get current subscription
      const { data: currentSub, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError) {
        return { success: false, error: 'No active subscription found' };
      }

      let cancelDate: Date;

      if (cancelAt === 'immediately') {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(currentSub.stripe_subscription_id as string);
        cancelDate = new Date();

        // Update status immediately
        await this.supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: cancelDate.toISOString(),
            cancellation_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Downgrade to free plan
        await this.updateUserLimits(userId, this.getFreePlanLimits());

      } else {
        // Cancel at end of period
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          currentSub.stripe_subscription_id as string
        );

        await this.stripe.subscriptions.update(
          currentSub.stripe_subscription_id as string,
          {
            cancel_at_period_end: true
          }
        );

        cancelDate = new Date(stripeSubscription.current_period_end * 1000);

        // Update with scheduled cancellation
        await this.supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: true,
            scheduled_cancel_at: cancelDate.toISOString(),
            cancellation_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      // Log the cancellation
      await this.supabase
        .from('subscription_events')
        .insert({
          user_id: userId,
          event_type: 'subscription_canceled',
          event_data: {
            cancel_date: cancelDate,
            cancel_type: cancelAt,
            reason: reason
          },
          created_at: new Date().toISOString()
        });

      return { 
        success: true, 
        cancelDate 
      };

    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Private helper methods
   */
  private async calculateProration(subscriptionId: string, newPriceId: string): Promise<number> {
    try {
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
        subscription_items: [{
          id: subscriptionId,
          price: newPriceId
        }]
      });

      return upcomingInvoice.amount_due || 0;
    } catch (error) {
      console.error('Proration calculation error:', error);
      return 0;
    }
  }

  private async validateDowngradeLimits(userId: string, newPlan: SubscriptionPlan): Promise<{
    canDowngrade: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    try {
      // Check current usage
      const { data: usage } = await this.supabase
        .from('user_usage_current')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (usage) {
        // Check presentations limit
        if (newPlan.features.presentations !== -1 && usage.presentations > newPlan.features.presentations) {
          violations.push(`Too many presentations (${usage.presentations}/${newPlan.features.presentations})`);
        }

        // Check team members limit
        if (newPlan.features.teamMembers !== -1 && usage.team_members > newPlan.features.teamMembers) {
          violations.push(`Too many team members (${usage.team_members}/${newPlan.features.teamMembers})`);
        }

        // Check storage limit
        if (usage.storage_gb > newPlan.features.storage) {
          violations.push(`Storage usage too high (${usage.storage_gb}GB/${newPlan.features.storage}GB)`);
        }
      }

      return {
        canDowngrade: violations.length === 0,
        violations
      };

    } catch (error) {
      console.error('Downgrade validation error:', error);
      return {
        canDowngrade: false,
        violations: ['Unable to validate current usage']
      };
    }
  }

  private async updateUserLimits(userId: string, plan: SubscriptionPlan): Promise<void> {
    await this.supabase
      .from('user_tier_limits')
      .upsert({
        user_id: userId,
        plan: plan.id,
        presentations_limit: plan.features.presentations,
        team_members_limit: plan.features.teamMembers,
        storage_limit_gb: plan.features.storage,
        exports_limit: plan.features.exports,
        updated_at: new Date().toISOString()
      });
  }

  private async logSubscriptionChange(change: SubscriptionChange, userId: string): Promise<void> {
    await this.supabase
      .from('subscription_changes')
      .insert({
        user_id: userId,
        from_plan: change.fromPlan,
        to_plan: change.toPlan,
        change_type: change.changeType,
        effective_date: change.effectiveDate.toISOString(),
        proration_amount: change.prorationAmount,
        reason: change.reason,
        created_at: new Date().toISOString()
      });
  }

  private async suspendUserAccess(userId: string, reason: string): Promise<void> {
    await this.supabase
      .from('user_access_status')
      .upsert({
        user_id: userId,
        status: 'suspended',
        reason: reason,
        suspended_at: new Date().toISOString()
      });
  }

  private async restoreUserAccess(userId: string): Promise<void> {
    await this.supabase
      .from('user_access_status')
      .upsert({
        user_id: userId,
        status: 'active',
        reason: null,
        suspended_at: null,
        restored_at: new Date().toISOString()
      });
  }

  private getFreePlanLimits(): SubscriptionPlan {
    return {
      id: 'free',
      name: 'free',
      displayName: 'Free',
      price: 0,
      billingCycle: 'monthly',
      features: {
        presentations: 3,
        teamMembers: 1,
        storage: 1,
        exports: 10,
        aiModels: ['gpt-3.5-turbo'],
        priority: 'standard',
        customBranding: false,
        apiAccess: false,
        offlineLLM: false,
        analytics: false,
        ssoIntegration: false
      },
      stripeProductId: '',
      stripePriceId: ''
    };
  }
}

export default SubscriptionManager;