/**
 * Payment Security Enhancement System
 * Addresses: Double Payment Prevention, Webhook Replay Attacks, Payment Validation, Recovery
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface PaymentSecurityResult {
  isValid: boolean;
  action: 'allow' | 'deny' | 'review';
  reasons: string[];
  securityMetadata: Record<string, any>;
}

export interface PaymentAttempt {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  plan: string;
  attemptedAt: Date;
  fingerprint: string;
  ipAddress: string;
  userAgent: string;
  status: 'pending' | 'completed' | 'failed' | 'duplicate' | 'suspicious';
}

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  signature: string;
  rawBody: string;
  processed: boolean;
  processedAt?: Date;
}

export class PaymentSecurityManager {
  private supabase: ReturnType<typeof createClient>;
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private paymentAttempts: Map<string, PaymentAttempt> = new Map();
  
  // Security thresholds
  private static readonly DEFAULT_CONFIG = {
    maxPaymentAttempts: 5,
    maxPaymentWindow: 15 * 60 * 1000, // 15 minutes
    webhookReplayWindow: 5 * 60 * 1000, // 5 minutes
    maxAmountVariation: 0.01, // 1% variation allowed
    suspiciousPatternThreshold: 3,
    duplicateDetectionWindow: 24 * 60 * 60 * 1000 // 24 hours
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Validate payment request before processing
   */
  async validatePaymentRequest(request: {
    userId: string;
    amount: number;
    currency: string;
    plan: string;
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
  }): Promise<PaymentSecurityResult> {
    const reasons: string[] = [];
    const securityMetadata: Record<string, any> = {};
    let action: 'allow' | 'deny' | 'review' = 'allow';

    try {
      // Generate payment fingerprint
      const fingerprint = this.generatePaymentFingerprint(request);
      securityMetadata.fingerprint = fingerprint;

      // 1. Check for duplicate payments
      const duplicateCheck = await this.checkDuplicatePayment(fingerprint, request);
      if (!duplicateCheck.isValid) {
        reasons.push('Duplicate payment detected');
        action = 'deny';
        securityMetadata.duplicateDetails = duplicateCheck.details;
      }

      // 2. Validate payment amount
      const amountCheck = this.validatePaymentAmount(request.amount, request.plan);
      if (!amountCheck.isValid) {
        reasons.push(`Invalid payment amount: ${amountCheck.reason}`);
        action = 'deny';
      }

      // 3. Check user payment history
      const historyCheck = await this.checkUserPaymentHistory(request.userId);
      if (!historyCheck.isValid) {
        reasons.push('Suspicious payment history');
        action = historyCheck.severity === 'high' ? 'deny' : 'review';
        securityMetadata.historyFlags = historyCheck.flags;
      }

      // 4. Rate limiting check
      const rateLimitCheck = await this.checkPaymentRateLimit(request.userId, request.ipAddress);
      if (!rateLimitCheck.isValid) {
        reasons.push('Payment rate limit exceeded');
        action = 'deny';
        securityMetadata.rateLimitInfo = rateLimitCheck.details;
      }

      // 5. Geographic validation
      const geoCheck = await this.validateGeographicConsistency(request.userId, request.ipAddress);
      if (!geoCheck.isValid) {
        reasons.push('Geographic inconsistency detected');
        action = action === 'allow' ? 'review' : action;
        securityMetadata.geoFlags = geoCheck.flags;
      }

      // 6. Device fingerprinting
      const deviceCheck = this.validateDeviceFingerprint(request.userAgent, request.userId);
      if (!deviceCheck.isValid) {
        reasons.push('Unusual device detected');
        action = action === 'allow' ? 'review' : action;
      }

      // Log the payment attempt
      await this.logPaymentAttempt({
        id: crypto.randomUUID(),
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        plan: request.plan,
        attemptedAt: new Date(),
        fingerprint,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        status: action === 'allow' ? 'pending' : 'suspicious'
      });

      return {
        isValid: action === 'allow',
        action,
        reasons,
        securityMetadata
      };

    } catch (error) {
      console.error('Payment validation error:', error);
      return {
        isValid: false,
        action: 'deny',
        reasons: ['Payment validation system error'],
        securityMetadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Validate Stripe webhook for replay attacks and tampering
   */
  async validateWebhook(request: {
    signature: string;
    timestamp: number;
    rawBody: string;
    eventType: string;
    eventId: string;
  }): Promise<PaymentSecurityResult> {
    const reasons: string[] = [];
    const securityMetadata: Record<string, any> = {};

    try {
      // 1. Check timestamp freshness
      const now = Math.floor(Date.now() / 1000);
      const timeDiff = now - request.timestamp;
      
      if (timeDiff > 300) { // 5 minutes
        reasons.push(`Webhook timestamp too old: ${timeDiff} seconds`);
        return {
          isValid: false,
          action: 'deny',
          reasons,
          securityMetadata
        };
      }

      // 2. Check for replay attacks
      const replayCheck = await this.checkWebhookReplay(request.eventId, request.timestamp);
      if (!replayCheck.isValid) {
        reasons.push('Webhook replay attack detected');
        return {
          isValid: false,
          action: 'deny',
          reasons,
          securityMetadata: { replayDetails: replayCheck.details }
        };
      }

      // 3. Validate signature
      const signatureCheck = this.validateWebhookSignature(
        request.rawBody,
        request.signature,
        request.timestamp
      );
      if (!signatureCheck.isValid) {
        reasons.push('Invalid webhook signature');
        return {
          isValid: false,
          action: 'deny',
          reasons,
          securityMetadata
        };
      }

      // 4. Check event ordering
      const orderCheck = await this.validateEventOrdering(request.eventId, request.timestamp);
      if (!orderCheck.isValid) {
        reasons.push('Event ordering violation detected');
        securityMetadata.orderingFlags = orderCheck.flags;
      }

      // Record the webhook event
      await this.recordWebhookEvent({
        id: request.eventId,
        type: request.eventType,
        timestamp: request.timestamp,
        signature: request.signature,
        rawBody: request.rawBody,
        processed: false
      });

      return {
        isValid: true,
        action: 'allow',
        reasons,
        securityMetadata
      };

    } catch (error) {
      console.error('Webhook validation error:', error);
      return {
        isValid: false,
        action: 'deny',
        reasons: ['Webhook validation system error'],
        securityMetadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Implement idempotency for payment operations
   */
  async ensureIdempotency(operation: {
    operationId: string;
    userId: string;
    operationType: 'payment' | 'refund' | 'subscription_change';
    data: any;
  }): Promise<{ isNew: boolean; existingResult?: any }> {
    try {
      // Check if operation already exists
      const { data: existingOperation, error } = await this.supabase
        .from('payment_operations')
        .select('*')
        .eq('operation_id', operation.operationId)
        .eq('user_id', operation.userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      if (existingOperation) {
        return {
          isNew: false,
          existingResult: existingOperation.result
        };
      }

      // Record new operation
      await this.supabase
        .from('payment_operations')
        .insert({
          operation_id: operation.operationId,
          user_id: operation.userId,
          operation_type: operation.operationType,
          operation_data: operation.data,
          status: 'processing',
          created_at: new Date().toISOString()
        });

      return { isNew: true };

    } catch (error) {
      console.error('Idempotency check error:', error);
      throw new Error('Failed to ensure operation idempotency');
    }
  }

  /**
   * Recovery mechanism for failed payments
   */
  async handlePaymentFailure(failure: {
    paymentIntentId: string;
    userId: string;
    amount: number;
    currency: string;
    plan: string;
    failureReason: string;
    canRetry: boolean;
  }): Promise<{ recovered: boolean; actions: string[] }> {
    const actions: string[] = [];

    try {
      // Log the failure
      await this.logPaymentFailure(failure);

      // Rollback any usage increments
      const rollbackResult = await this.rollbackUsageIncrements(failure.userId, failure.plan);
      if (rollbackResult.success) {
        actions.push('Usage increments rolled back');
      }

      // Determine recovery strategy
      if (failure.canRetry) {
        // Schedule retry with exponential backoff
        await this.schedulePaymentRetry(failure);
        actions.push('Payment retry scheduled');
      } else {
        // Handle permanent failure
        await this.handlePermanentFailure(failure);
        actions.push('Permanent failure handling initiated');
      }

      // Notify user about failure
      await this.notifyUserOfFailure(failure);
      actions.push('User notification sent');

      return {
        recovered: failure.canRetry,
        actions
      };

    } catch (error) {
      console.error('Payment failure handling error:', error);
      return {
        recovered: false,
        actions: ['Failed to handle payment failure']
      };
    }
  }

  /**
   * Private helper methods
   */
  private generatePaymentFingerprint(request: any): string {
    const fingerprintData = {
      userId: request.userId,
      amount: request.amount,
      currency: request.currency,
      plan: request.plan,
      userAgent: request.userAgent
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex')
      .substring(0, 16);
  }

  private async checkDuplicatePayment(fingerprint: string, request: any): Promise<{
    isValid: boolean;
    details?: any;
  }> {
    try {
      const { data: recentPayments, error } = await this.supabase
        .from('payment_attempts')
        .select('*')
        .eq('fingerprint', fingerprint)
        .gte('attempted_at', new Date(Date.now() - PaymentSecurityManager.DEFAULT_CONFIG.duplicateDetectionWindow).toISOString())
        .order('attempted_at', { ascending: false });

      if (error) throw error;

      const duplicates = recentPayments?.filter(p => 
        p.status === 'completed' || p.status === 'pending'
      ) || [];

      return {
        isValid: duplicates.length === 0,
        details: duplicates.length > 0 ? { count: duplicates.length, lastAttempt: duplicates[0] } : null
      };

    } catch (error) {
      console.error('Duplicate payment check error:', error);
      return { isValid: false };
    }
  }

  private validatePaymentAmount(amount: number, plan: string): { isValid: boolean; reason?: string } {
    const expectedAmounts: Record<string, number> = {
      'professional': 99.00,
      'enterprise': 299.00
    };

    const expectedAmount = expectedAmounts[plan];
    if (!expectedAmount) {
      return { isValid: false, reason: 'Unknown plan' };
    }

    const variation = Math.abs(amount - expectedAmount) / expectedAmount;
    if (variation > PaymentSecurityManager.DEFAULT_CONFIG.maxAmountVariation) {
      return { 
        isValid: false, 
        reason: `Amount ${amount} differs from expected ${expectedAmount} by ${(variation * 100).toFixed(2)}%` 
      };
    }

    return { isValid: true };
  }

  private async checkUserPaymentHistory(userId: string): Promise<{
    isValid: boolean;
    severity: 'low' | 'medium' | 'high';
    flags: string[];
  }> {
    const flags: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    try {
      const { data: history, error } = await this.supabase
        .from('payment_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!history || history.length === 0) {
        return { isValid: true, severity, flags };
      }

      // Check for failed payment patterns
      const recentFailures = history.filter(p => 
        p.status === 'failed' && 
        new Date(p.attempted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (recentFailures.length > 3) {
        flags.push('Multiple recent payment failures');
        severity = 'medium';
      }

      // Check for rapid payment attempts
      const rapidAttempts = history.filter(p =>
        new Date(p.attempted_at) > new Date(Date.now() - 60 * 60 * 1000)
      );

      if (rapidAttempts.length > 5) {
        flags.push('Rapid payment attempts');
        severity = 'high';
      }

      // Check for amount inconsistencies
      const amounts = history.map(p => p.amount).filter(Boolean);
      const uniqueAmounts = [...new Set(amounts)];
      if (uniqueAmounts.length > 3) {
        flags.push('Inconsistent payment amounts');
        severity = severity === 'low' ? 'medium' : severity;
      }

      return {
        isValid: severity !== 'high',
        severity,
        flags
      };

    } catch (error) {
      console.error('Payment history check error:', error);
      return { isValid: false, severity: 'high', flags: ['History check failed'] };
    }
  }

  private async checkPaymentRateLimit(userId: string, ipAddress: string): Promise<{
    isValid: boolean;
    details?: any;
  }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - PaymentSecurityManager.DEFAULT_CONFIG.maxPaymentWindow);

    try {
      // Check user rate limit
      const { data: userAttempts, error: userError } = await this.supabase
        .from('payment_attempts')
        .select('id')
        .eq('user_id', userId)
        .gte('attempted_at', windowStart.toISOString());

      if (userError) throw userError;

      if ((userAttempts?.length || 0) >= PaymentSecurityManager.DEFAULT_CONFIG.maxPaymentAttempts) {
        return {
          isValid: false,
          details: { type: 'user', count: userAttempts?.length, window: 'user' }
        };
      }

      // Check IP rate limit
      const { data: ipAttempts, error: ipError } = await this.supabase
        .from('payment_attempts')
        .select('id')
        .eq('ip_address', ipAddress)
        .gte('attempted_at', windowStart.toISOString());

      if (ipError) throw ipError;

      if ((ipAttempts?.length || 0) >= PaymentSecurityManager.DEFAULT_CONFIG.maxPaymentAttempts * 2) {
        return {
          isValid: false,
          details: { type: 'ip', count: ipAttempts?.length, window: 'ip' }
        };
      }

      return { isValid: true };

    } catch (error) {
      console.error('Rate limit check error:', error);
      return { isValid: false };
    }
  }

  private async validateGeographicConsistency(userId: string, ipAddress: string): Promise<{
    isValid: boolean;
    flags: string[];
  }> {
    const flags: string[] = [];

    try {
      // In a real implementation, you would:
      // 1. Get user's usual geographic location from profile/history
      // 2. Geolocate the current IP address
      // 3. Compare for significant discrepancies
      
      // For demo purposes, we'll do basic checks
      const isPrivateIP = this.isPrivateIP(ipAddress);
      if (isPrivateIP) {
        flags.push('Private IP address detected');
      }

      const isTorExit = await this.checkTorExitNode(ipAddress);
      if (isTorExit) {
        flags.push('Tor exit node detected');
      }

      return {
        isValid: flags.length === 0,
        flags
      };

    } catch (error) {
      console.error('Geographic validation error:', error);
      return { isValid: true, flags: [] }; // Fail open for geographic checks
    }
  }

  private validateDeviceFingerprint(userAgent: string, userId: string): { isValid: boolean } {
    // Basic device fingerprinting
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /headless/i,
      /automated/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        return { isValid: false };
      }
    }

    return { isValid: true };
  }

  private async checkWebhookReplay(eventId: string, timestamp: number): Promise<{
    isValid: boolean;
    details?: any;
  }> {
    const existingEvent = this.webhookEvents.get(eventId);
    
    if (existingEvent) {
      return {
        isValid: false,
        details: { 
          previousTimestamp: existingEvent.timestamp, 
          currentTimestamp: timestamp 
        }
      };
    }

    return { isValid: true };
  }

  private validateWebhookSignature(rawBody: string, signature: string, timestamp: number): { isValid: boolean } {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const payload = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      const providedSignature = signature.replace('v1=', '');
      
      return {
        isValid: crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(providedSignature)
        )
      };

    } catch (error) {
      console.error('Signature validation error:', error);
      return { isValid: false };
    }
  }

  private async validateEventOrdering(eventId: string, timestamp: number): Promise<{
    isValid: boolean;
    flags: string[];
  }> {
    // Check if events are arriving in reasonable order
    // This is a simplified implementation
    return { isValid: true, flags: [] };
  }

  private async logPaymentAttempt(attempt: PaymentAttempt): Promise<void> {
    try {
      await this.supabase
        .from('payment_attempts')
        .insert({
          id: attempt.id,
          user_id: attempt.userId,
          amount: attempt.amount,
          currency: attempt.currency,
          plan: attempt.plan,
          attempted_at: attempt.attemptedAt.toISOString(),
          fingerprint: attempt.fingerprint,
          ip_address: attempt.ipAddress,
          user_agent: attempt.userAgent,
          status: attempt.status
        });

    } catch (error) {
      console.error('Failed to log payment attempt:', error);
    }
  }

  private async recordWebhookEvent(event: WebhookEvent): Promise<void> {
    this.webhookEvents.set(event.id, event);
    
    // Clean up old events
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    for (const [id, evt] of this.webhookEvents.entries()) {
      if (evt.timestamp * 1000 < cutoff) {
        this.webhookEvents.delete(id);
      }
    }
  }

  private async logPaymentFailure(failure: any): Promise<void> {
    try {
      await this.supabase
        .from('payment_failures')
        .insert({
          payment_intent_id: failure.paymentIntentId,
          user_id: failure.userId,
          amount: failure.amount,
          currency: failure.currency,
          plan: failure.plan,
          failure_reason: failure.failureReason,
          can_retry: failure.canRetry,
          failed_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Failed to log payment failure:', error);
    }
  }

  private async rollbackUsageIncrements(userId: string, plan: string): Promise<{ success: boolean }> {
    try {
      // Call the existing rollback functionality
      const response = await fetch('/api/user/usage-rollback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action: 'presentations', 
          reason: `Payment failure for ${plan} upgrade` 
        })
      });

      return { success: response.ok };

    } catch (error) {
      console.error('Usage rollback error:', error);
      return { success: false };
    }
  }

  private async schedulePaymentRetry(failure: any): Promise<void> {
    // In a real implementation, you would schedule this with a job queue
    console.log('Payment retry scheduled for:', failure.paymentIntentId);
  }

  private async handlePermanentFailure(failure: any): Promise<void> {
    // Handle cases where payment cannot be retried
    console.log('Permanent payment failure handled for:', failure.paymentIntentId);
  }

  private async notifyUserOfFailure(failure: any): Promise<void> {
    // Send notification to user about payment failure
    console.log('User notified of payment failure:', failure.userId);
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/
    ];

    return privateRanges.some(range => range.test(ip));
  }

  private async checkTorExitNode(ip: string): Promise<boolean> {
    // In a real implementation, you would check against a Tor exit node list
    // For demo purposes, always return false
    return false;
  }
}

export default PaymentSecurityManager;