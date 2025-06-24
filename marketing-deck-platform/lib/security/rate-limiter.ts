/**
 * Advanced Rate Limiting System
 * Addresses: API Rate Limiting, Abuse Prevention, Adaptive Throttling
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  enableAdaptiveLimit: boolean;
  burstSize: number;
  adaptiveThreshold: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  reason?: string;
  metadata: {
    windowStart: number;
    windowEnd: number;
    currentRequests: number;
    burstUsed: number;
    adaptiveMultiplier: number;
  };
}

export interface RateLimitEntry {
  key: string;
  windowStart: number;
  requests: number;
  burstUsed: number;
  lastRequest: number;
  successRate: number;
  adaptiveMultiplier: number;
}

export class AdvancedRateLimiter {
  private supabase: ReturnType<typeof createClient>;
  private limitStore: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  // Predefined rate limit configurations for different endpoints  
  private static readonly ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
    'auth_login': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableAdaptiveLimit: false,
      burstSize: 2,
      adaptiveThreshold: 0.8
    },
    'auth_register': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      enableAdaptiveLimit: false,
      burstSize: 1,
      adaptiveThreshold: 0.9
    },
    'api_openai': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
      enableAdaptiveLimit: true,
      burstSize: 3,
      adaptiveThreshold: 0.7
    },
    'api_upload': {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxRequests: 20,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
      enableAdaptiveLimit: true,
      burstSize: 5,
      adaptiveThreshold: 0.8
    },
    'api_presentation': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableAdaptiveLimit: true,
      burstSize: 10,
      adaptiveThreshold: 0.75
    },
    'api_stripe': {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 5,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableAdaptiveLimit: false,
      burstSize: 1,
      adaptiveThreshold: 0.9
    },
    'default': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      enableAdaptiveLimit: true,
      burstSize: 20,
      adaptiveThreshold: 0.8
    }
  };

  // Default configuration settings for backward compatibility
  private static readonly DEFAULT_CONFIG = AdvancedRateLimiter.ENDPOINT_CONFIGS;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * Check rate limit for a specific endpoint and identifier
   */
  async checkRateLimit(
    endpoint: string,
    identifier: string,
    identifierType: 'user' | 'ip' | 'session' = 'user',
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const config = {
      ...this.getEndpointConfig(endpoint),
      ...customConfig
    };

    const key = this.generateKey(endpoint, identifier, identifierType);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Get or create rate limit entry
      let entry = await this.getRateLimitEntry(key, windowStart);
      
      // Calculate adaptive multiplier if enabled
      if (config.enableAdaptiveLimit) {
        entry.adaptiveMultiplier = this.calculateAdaptiveMultiplier(
          entry,
          config.adaptiveThreshold
        );
      }

      // Calculate effective limits
      const effectiveMaxRequests = Math.floor(
        config.maxRequests * entry.adaptiveMultiplier
      );
      const effectiveBurstSize = Math.floor(
        config.burstSize * entry.adaptiveMultiplier
      );

      // Check if request is allowed
      const isAllowed = this.isRequestAllowed(entry, effectiveMaxRequests, effectiveBurstSize);
      
      if (isAllowed) {
        // Update counters
        entry.requests++;
        entry.lastRequest = now;
        
        // Use burst if needed
        if (entry.requests > effectiveMaxRequests - effectiveBurstSize) {
          entry.burstUsed++;
        }

        await this.updateRateLimitEntry(key, entry);
      }

      const remaining = Math.max(0, effectiveMaxRequests - entry.requests);
      const resetTime = entry.windowStart + config.windowMs;
      const retryAfter = isAllowed ? undefined : Math.ceil((resetTime - now) / 1000);

      return {
        allowed: isAllowed,
        remaining,
        resetTime,
        retryAfter,
        reason: isAllowed ? undefined : this.getRateLimitReason(entry, effectiveMaxRequests),
        metadata: {
          windowStart: entry.windowStart,
          windowEnd: resetTime,
          currentRequests: entry.requests,
          burstUsed: entry.burstUsed,
          adaptiveMultiplier: entry.adaptiveMultiplier
        }
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open for system errors
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        metadata: {
          windowStart: windowStart,
          windowEnd: now + config.windowMs,
          currentRequests: 0,
          burstUsed: 0,
          adaptiveMultiplier: 1
        }
      };
    }
  }

  /**
   * Record the success/failure of a request for adaptive limiting
   */
  async recordRequestOutcome(
    endpoint: string,
    identifier: string,
    identifierType: 'user' | 'ip' | 'session',
    success: boolean
  ): Promise<void> {
    const key = this.generateKey(endpoint, identifier, identifierType);
    
    try {
      const entry = this.limitStore.get(key);
      if (entry) {
        // Update success rate (moving average)
        const alpha = 0.1; // Smoothing factor
        entry.successRate = success 
          ? entry.successRate + alpha * (1 - entry.successRate)
          : entry.successRate + alpha * (0 - entry.successRate);
        
        await this.updateRateLimitEntry(key, entry);
      }

      // Log for analytics
      await this.logRequestOutcome(endpoint, identifier, identifierType, success);

    } catch (error) {
      console.error('Error recording request outcome:', error);
    }
  }

  /**
   * Get rate limit status without incrementing counters
   */
  async getRateLimitStatus(
    endpoint: string,
    identifier: string,
    identifierType: 'user' | 'ip' | 'session' = 'user'
  ): Promise<Omit<RateLimitResult, 'allowed'> & { status: 'within_limit' | 'near_limit' | 'over_limit' }> {
    const config = this.getEndpointConfig(endpoint);
    const key = this.generateKey(endpoint, identifier, identifierType);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const entry = await this.getRateLimitEntry(key, windowStart);
    const effectiveMaxRequests = Math.floor(config.maxRequests * entry.adaptiveMultiplier);
    const remaining = Math.max(0, effectiveMaxRequests - entry.requests);
    const resetTime = entry.windowStart + config.windowMs;

    let status: 'within_limit' | 'near_limit' | 'over_limit';
    if (entry.requests >= effectiveMaxRequests) {
      status = 'over_limit';
    } else if (entry.requests >= effectiveMaxRequests * 0.8) {
      status = 'near_limit';
    } else {
      status = 'within_limit';
    }

    return {
      remaining,
      resetTime,
      status,
      metadata: {
        windowStart: entry.windowStart,
        windowEnd: resetTime,
        currentRequests: entry.requests,
        burstUsed: entry.burstUsed,
        adaptiveMultiplier: entry.adaptiveMultiplier
      }
    };
  }

  /**
   * Reset rate limit for a specific key (admin function)
   */
  async resetRateLimit(
    endpoint: string,
    identifier: string,
    identifierType: 'user' | 'ip' | 'session' = 'user'
  ): Promise<void> {
    const key = this.generateKey(endpoint, identifier, identifierType);
    
    try {
      this.limitStore.delete(key);
      
      await this.supabase
        .from('rate_limits')
        .delete()
        .eq('key', key);

    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  /**
   * Get global rate limit statistics
   */
  async getGlobalStatistics(): Promise<{
    totalActiveUsers: number;
    topEndpoints: Array<{ endpoint: string; requests: number }>;
    averageSuccessRate: number;
    blockedRequests: number;
  }> {
    try {
      const { data: stats, error } = await this.supabase
        .from('rate_limit_stats')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process statistics
      const activeUsers = new Set(stats?.map(s => s.identifier) || []).size;
      const endpointCounts = new Map<string, number>();
      let totalRequests = 0;
      let successfulRequests = 0;
      let blockedRequests = 0;

      for (const stat of stats || []) {
        endpointCounts.set(stat.endpoint, (endpointCounts.get(stat.endpoint) || 0) + stat.requests);
        totalRequests += stat.requests;
        if (stat.success) successfulRequests += stat.requests;
        if (stat.blocked) blockedRequests += stat.requests;
      }

      const topEndpoints = Array.from(endpointCounts.entries())
        .map(([endpoint, requests]) => ({ endpoint, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10);

      return {
        totalActiveUsers: activeUsers,
        topEndpoints,
        averageSuccessRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
        blockedRequests
      };

    } catch (error) {
      console.error('Error getting global statistics:', error);
      return {
        totalActiveUsers: 0,
        topEndpoints: [],
        averageSuccessRate: 0,
        blockedRequests: 0
      };
    }
  }

  /**
   * Private helper methods
   */
  private getEndpointConfig(endpoint: string): RateLimitConfig {
    // Extract base endpoint from path
    const baseEndpoint = this.extractBaseEndpoint(endpoint);
    return AdvancedRateLimiter.ENDPOINT_CONFIGS[baseEndpoint] || 
           AdvancedRateLimiter.ENDPOINT_CONFIGS.default;
  }

  private extractBaseEndpoint(endpoint: string): string {
    const patterns: Record<string, string> = {
      '/api/auth/login': 'auth_login',
      '/api/auth/register': 'auth_register',
      '/api/openai/': 'api_openai',
      '/api/upload': 'api_upload',
      '/api/presentations': 'api_presentation',
      '/api/stripe/': 'api_stripe'
    };

    for (const [pattern, key] of Object.entries(patterns)) {
      if (endpoint.includes(pattern)) {
        return key;
      }
    }

    return 'default';
  }

  private generateKey(endpoint: string, identifier: string, identifierType: string): string {
    const baseEndpoint = this.extractBaseEndpoint(endpoint);
    return `ratelimit:${baseEndpoint}:${identifierType}:${identifier}`;
  }

  private async getRateLimitEntry(key: string, windowStart: number): Promise<RateLimitEntry> {
    // Try memory store first
    let entry = this.limitStore.get(key);
    
    if (!entry || entry.windowStart < windowStart) {
      // Create new window or fetch from database
      entry = await this.fetchOrCreateEntry(key, windowStart);
    }

    return entry;
  }

  private async fetchOrCreateEntry(key: string, windowStart: number): Promise<RateLimitEntry> {
    try {
      const { data: existingEntry, error } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .gte('window_start', new Date(windowStart).toISOString())
        .single();

      if (existingEntry && !error) {
        const entry: RateLimitEntry = {
          key,
          windowStart: new Date(existingEntry.window_start).getTime(),
          requests: existingEntry.requests,
          burstUsed: existingEntry.burst_used,
          lastRequest: new Date(existingEntry.last_request).getTime(),
          successRate: (existingEntry.success_rate as number) || 0,
          adaptiveMultiplier: (existingEntry.adaptive_multiplier as number) || 0
        };
        
        this.limitStore.set(key, entry);
        return entry;
      }

    } catch (error) {
      console.error('Error fetching rate limit entry:', error);
    }

    // Create new entry
    const entry: RateLimitEntry = {
      key,
      windowStart,
      requests: 0,
      burstUsed: 0,
      lastRequest: windowStart,
      successRate: 1.0,
      adaptiveMultiplier: 1.0
    };

    this.limitStore.set(key, entry);
    return entry;
  }

  private async updateRateLimitEntry(key: string, entry: RateLimitEntry): Promise<void> {
    this.limitStore.set(key, entry);

    try {
      await this.supabase
        .from('rate_limits')
        .upsert({
          key,
          window_start: new Date(entry.windowStart).toISOString(),
          requests: entry.requests,
          burst_used: entry.burstUsed,
          last_request: new Date(entry.lastRequest).toISOString(),
          success_rate: entry.successRate,
          adaptive_multiplier: entry.adaptiveMultiplier,
          updated_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error updating rate limit entry:', error);
    }
  }

  private calculateAdaptiveMultiplier(entry: RateLimitEntry, threshold: number): number {
    // Adjust limit based on success rate
    if (entry.successRate >= threshold) {
      // Good behavior - allow slight increase
      return Math.min(entry.adaptiveMultiplier * 1.05, 1.5);
    } else {
      // Poor behavior - decrease limit
      return Math.max(entry.adaptiveMultiplier * 0.9, 0.1);
    }
  }

  private isRequestAllowed(
    entry: RateLimitEntry,
    maxRequests: number,
    burstSize: number
  ): boolean {
    // Check base limit
    if (entry.requests < maxRequests - burstSize) {
      return true;
    }

    // Check burst allowance
    if (entry.requests < maxRequests && entry.burstUsed < burstSize) {
      return true;
    }

    return false;
  }

  private getRateLimitReason(entry: RateLimitEntry, maxRequests: number): string {
    if (entry.requests >= maxRequests) {
      return 'Rate limit exceeded';
    }
    if (entry.burstUsed >= entry.requests) {
      return 'Burst limit exceeded';
    }
    return 'Rate limit violation';
  }

  private async logRequestOutcome(
    endpoint: string,
    identifier: string,
    identifierType: string,
    success: boolean
  ): Promise<void> {
    try {
      await this.supabase
        .from('rate_limit_logs')
        .insert({
          endpoint,
          identifier,
          identifier_type: identifierType,
          success,
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error logging request outcome:', error);
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, entry] of this.limitStore.entries()) {
      if (now - entry.lastRequest > maxAge) {
        this.limitStore.delete(key);
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function createRateLimitMiddleware(
  rateLimiter: AdvancedRateLimiter,
  options: {
    keyGenerator?: (req: any) => { endpoint: string; identifier: string; identifierType: 'user' | 'ip' | 'session' };
    onLimitReached?: (req: any, result: RateLimitResult) => void;
    skipPaths?: string[];
  } = {}
) {
  return async function rateLimitMiddleware(req: any, res: any, next: () => void) {
    try {
      // Skip rate limiting for certain paths
      if (options.skipPaths?.some(path => req.url?.includes(path))) {
        return next();
      }

      // Generate key
      const keyData = options.keyGenerator ? 
        options.keyGenerator(req) : 
        {
          endpoint: req.url || 'unknown',
          identifier: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
          identifierType: 'ip' as const
        };

      // Check rate limit
      const result = await rateLimiter.checkRateLimit(
        keyData.endpoint,
        keyData.identifier,
        keyData.identifierType
      );

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.metadata.currentRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetTime);

      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }

        if (options.onLimitReached) {
          options.onLimitReached(req, result);
        }

        return res.status(429).json({
          error: 'Too Many Requests',
          message: result.reason || 'Rate limit exceeded',
          retryAfter: result.retryAfter
        });
      }

      next();

    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open
      next();
    }
  };
}

export default AdvancedRateLimiter;