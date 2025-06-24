/**
 * Demo User Management System
 * Handles demo accounts with 5 deck limit and abuse detection
 */

import { createClient } from '@supabase/supabase-js';

export interface DemoUser {
  id: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  presentationsUsed: number;
  presentationsLimit: number;
  changesCount: number;
  lastActivity: Date;
  isBlocked: boolean;
  blockReason?: string;
}

export interface DemoUsageStats {
  totalChanges: number;
  changesLast24h: number;
  changesLast1h: number;
  avgChangesPerSession: number;
  suspiciousActivity: boolean;
  riskScore: number;
}

export interface AbuseDetectionResult {
  isAbusive: boolean;
  riskScore: number;
  reasons: string[];
  action: 'allow' | 'warn' | 'throttle' | 'block';
  cooldownMinutes?: number;
}

// Add this type for the demo_users table row
export interface DemoUserRow {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  presentations_used: number;
  presentations_limit: number;
  changes_count: number;
  last_activity: string;
  is_blocked: boolean;
  block_reason?: string;
  referral_source?: string;
}

export class DemoUserManager {
  private supabase: ReturnType<typeof createClient>;

  // Demo user limits and thresholds
  private static readonly DEMO_LIMITS = {
    presentationsLimit: 5,
    maxChangesPerHour: 50,
    maxChangesPerDay: 200,
    maxChangesPerSession: 25,
    sessionTimeoutMinutes: 30,
    accountExpiryDays: 7,
    maxRegenerationsPerPresentation: 10
  };

  // Abuse detection thresholds
  private static readonly ABUSE_THRESHOLDS = {
    rapidChanges: 20, // changes in 5 minutes
    suspiciousPatterns: 0.8, // pattern similarity threshold
    botBehavior: 0.9, // bot detection score
    highFrequency: 100, // changes per hour
    riskScore: 75 // overall risk threshold
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Create demo user account
   */
  async createDemoUser(email: string, referralSource?: string): Promise<{
    success: boolean;
    demoUser?: DemoUser;
    error?: string;
  }> {
    try {
      // Check if email already has demo account
      const { data: existingDemo } = await this.supabase
        .from('demo_users')
        .select('id, expires_at')
        .eq('email', email.toLowerCase())
        .single();
      const existingDemoTyped = existingDemo as DemoUserRow | null;
      if (existingDemoTyped) {
        if (new Date(existingDemoTyped.expires_at) > new Date()) {
          return { success: false, error: 'Demo account already exists for this email' };
        } else {
          // Expired demo account - allow recreation
          await this.supabase
            .from('demo_users')
            .delete()
            .eq('id', existingDemoTyped.id);
        }
      }

      // Create demo user
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + DemoUserManager.DEMO_LIMITS.accountExpiryDays);

      const { data: demoUser, error } = await this.supabase
        .from('demo_users')
        .insert({
          email: email.toLowerCase(),
          expires_at: expiresAt.toISOString(),
          presentations_used: 0,
          presentations_limit: DemoUserManager.DEMO_LIMITS.presentationsLimit,
          changes_count: 0,
          last_activity: new Date().toISOString(),
          is_blocked: false,
          referral_source: referralSource,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      const demoUserTyped = demoUser as DemoUserRow;

      if (error) {
        throw new Error(`Failed to create demo user: ${error.message}`);
      }

      // Log demo user creation
      await this.logDemoEvent(demoUserTyped.id, 'demo_user_created', {
        email,
        referral_source: referralSource,
        expires_at: expiresAt
      });

      return {
        success: true,
        demoUser: {
          id: demoUserTyped.id,
          email: demoUserTyped.email,
          createdAt: new Date(demoUserTyped.created_at),
          expiresAt: new Date(demoUserTyped.expires_at),
          presentationsUsed: demoUserTyped.presentations_used,
          presentationsLimit: demoUserTyped.presentations_limit,
          changesCount: demoUserTyped.changes_count,
          lastActivity: new Date(demoUserTyped.last_activity),
          isBlocked: demoUserTyped.is_blocked,
          blockReason: demoUserTyped.block_reason
        }
      };

    } catch (error) {
      console.error('Create demo user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if demo user can create presentation
   */
  async canCreatePresentation(demoUserId: string): Promise<{
    canCreate: boolean;
    reason?: string;
    remainingPresentations?: number;
  }> {
    try {
      const { data: demoUserRaw } = await this.supabase
        .from('demo_users')
        .select('*')
        .eq('id', demoUserId)
        .single();
      const demoUser = demoUserRaw as DemoUserRow | null;
      if (!demoUser) {
        return { canCreate: false, reason: 'Demo user not found' };
      }
      if (new Date(demoUser.expires_at) < new Date()) {
        return { canCreate: false, reason: 'Demo account has expired' };
      }
      if (demoUser.is_blocked) {
        return { canCreate: false, reason: demoUser.block_reason || 'Account blocked' };
      }
      if (demoUser.presentations_used >= demoUser.presentations_limit) {
        return {
          canCreate: false,
          reason: `Demo limit reached (${demoUser.presentations_limit} presentations)`,
          remainingPresentations: 0
        };
      }
      return {
        canCreate: true,
        remainingPresentations: demoUser.presentations_limit - demoUser.presentations_used
      };
    } catch (error) {
      console.error('Check presentation creation error:', error);
      return { canCreate: false, reason: 'Unable to verify demo limits' };
    }
  }

  /**
   * Record presentation creation for demo user
   */
  async recordPresentationCreated(demoUserId: string): Promise<{
    success: boolean;
    remainingPresentations?: number;
    error?: string;
  }> {
    try {
      const { data: demoUserRaw, error: fetchError } = await this.supabase
        .from('demo_users')
        .select('*')
        .eq('id', demoUserId)
        .single();
      const demoUser = demoUserRaw as DemoUserRow | null;
      if (fetchError || !demoUser) throw new Error('Demo user not found');
      const { data: updatedRaw, error } = await this.supabase
        .from('demo_users')
        .update({
          presentations_used: demoUser.presentations_used as number + 1,
          last_activity: new Date().toISOString()
        })
        .eq('id', demoUserId)
        .select()
        .single();
      const updated = updatedRaw as unknown as DemoUserRow | null;
      if (!updated) throw new Error('Failed to update demo usage');
      if (error) throw new Error(`Failed to update demo usage: ${error.message}`);
      await this.logDemoEvent(demoUser.id, 'presentation_created', {
        total_used: updated.presentations_used as number,
        remaining: updated.presentations_limit as number - updated.presentations_used as number
      });
      return {
        success: true,
        remainingPresentations: updated.presentations_limit as number - updated.presentations_used as number
      };
    } catch (error) {
      console.error('Record presentation created error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if demo user can make changes (abuse detection)
   */
  async canMakeChanges(demoUserId: string, changeType: string): Promise<{
    canChange: boolean;
    reason?: string;
    cooldownMinutes?: number;
    riskScore?: number;
  }> {
    try {
      // Get current usage stats
      const usageStats = await this.getDemoUsageStats(demoUserId);
      
      // Run abuse detection
      const abuseDetection = await this.detectAbuse(demoUserId, usageStats, changeType);

      if (abuseDetection.isAbusive) {
        // Block or throttle user based on risk score
        if (abuseDetection.action === 'block') {
          await this.blockDemoUser(demoUserId, abuseDetection.reasons.join(', '));
          return {
            canChange: false,
            reason: 'Account blocked due to suspicious activity',
            riskScore: abuseDetection.riskScore
          };
        } else if (abuseDetection.action === 'throttle') {
          return {
            canChange: false,
            reason: 'Too many changes too quickly. Please wait before making more changes.',
            cooldownMinutes: abuseDetection.cooldownMinutes,
            riskScore: abuseDetection.riskScore
          };
        }
      }

      return { canChange: true, riskScore: abuseDetection.riskScore };

    } catch (error) {
      console.error('Check changes permission error:', error);
      return { canChange: false, reason: 'Unable to verify change permissions' };
    }
  }

  /**
   * Record change made by demo user
   */
  async recordChange(
    demoUserId: string,
    changeType: string,
    metadata: any = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: demoUserRaw, error: fetchError } = await this.supabase
        .from('demo_users')
        .select('*')
        .eq('id', demoUserId)
        .single();
      const demoUser = demoUserRaw as DemoUserRow | null;
      if (fetchError || !demoUser) throw new Error('Demo user not found');
      await this.supabase
        .from('demo_users')
        .update({
          changes_count: demoUser.changes_count as number + 1,
          last_activity: new Date().toISOString()
        })
        .eq('id', demoUserId);
      await this.supabase
        .from('demo_user_changes')
        .insert({
          demo_user_id: demoUserId,
          change_type: changeType,
          metadata: metadata,
          created_at: new Date().toISOString()
        });
      return { success: true };
    } catch (error) {
      console.error('Record change error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get demo user limits and usage
   */
  async getDemoUserStatus(demoUserId: string): Promise<{
    user: DemoUser | null;
    usage: DemoUsageStats | null;
    limits: typeof DemoUserManager.DEMO_LIMITS;
  }> {
    try {
      const { data: demoUserRaw } = await this.supabase
        .from('demo_users')
        .select('*')
        .eq('id', demoUserId)
        .single();
      const demoUser = demoUserRaw as DemoUserRow | null;
      if (!demoUser) {
        return { user: null, usage: null, limits: DemoUserManager.DEMO_LIMITS };
      }
      const user: DemoUser = {
        id: demoUser.id as string,
        email: demoUser.email as string,
        createdAt: new Date(demoUser.created_at as string),
        expiresAt: new Date(demoUser.expires_at as string),
        presentationsUsed: demoUser.presentations_used as number,
        presentationsLimit: demoUser.presentations_limit as number,
        changesCount: demoUser.changes_count as number,
        lastActivity: new Date(demoUser.last_activity as string),
        isBlocked: demoUser.is_blocked as boolean,
        blockReason: demoUser.block_reason as string | undefined
      };
      const usage = await this.getDemoUsageStats(demoUserId);
      return { user, usage, limits: DemoUserManager.DEMO_LIMITS };
    } catch (error) {
      console.error('Get demo user status error:', error);
      return { user: null, usage: null, limits: DemoUserManager.DEMO_LIMITS };
    }
  }

  /**
   * Clean up expired demo users
   */
  async cleanupExpiredDemoUsers(): Promise<{
    cleanedUsers: number;
    cleanedChanges: number;
    cleanedPresentations: number;
  }> {
    try {
      // Get expired demo users
      const { data: expiredUsers } = await this.supabase
        .from('demo_users')
        .select('id')
        .lt('expires_at', new Date().toISOString());

      if (!expiredUsers || expiredUsers.length === 0) {
        return { cleanedUsers: 0, cleanedChanges: 0, cleanedPresentations: 0 };
      }

      const expiredUserIds = expiredUsers.map(u => u.id);

      // Clean up changes
      const { count: cleanedChanges } = await this.supabase
        .from('demo_user_changes')
        .delete()
        .in('demo_user_id', expiredUserIds);

      // Clean up presentations (mark as expired)
      const { count: cleanedPresentations } = await this.supabase
        .from('presentations')
        .update({ status: 'expired' })
        .in('demo_user_id', expiredUserIds);

      // Delete demo users
      const { count: cleanedUsers } = await this.supabase
        .from('demo_users')
        .delete()
        .in('id', expiredUserIds);

      return {
        cleanedUsers: cleanedUsers || 0,
        cleanedChanges: cleanedChanges || 0,
        cleanedPresentations: cleanedPresentations || 0
      };

    } catch (error) {
      console.error('Cleanup expired demo users error:', error);
      return { cleanedUsers: 0, cleanedChanges: 0, cleanedPresentations: 0 };
    }
  }

  /**
   * Private helper methods
   */
  private async getDemoUsageStats(demoUserId: string): Promise<DemoUsageStats> {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last1h = new Date(now.getTime() - 60 * 60 * 1000);

      // Get changes in different time windows
      const { data: allChanges } = await this.supabase
        .from('demo_user_changes')
        .select('created_at, change_type, metadata')
        .eq('demo_user_id', demoUserId);

      const { data: changes24h } = await this.supabase
        .from('demo_user_changes')
        .select('created_at')
        .eq('demo_user_id', demoUserId)
        .gte('created_at', last24h.toISOString());

      const { data: changes1h } = await this.supabase
        .from('demo_user_changes')
        .select('created_at')
        .eq('demo_user_id', demoUserId)
        .gte('created_at', last1h.toISOString());

      // Calculate suspicious activity patterns
      const suspiciousActivity = this.detectSuspiciousPatterns(allChanges || []);
      const riskScore = this.calculateRiskScore(allChanges || [], changes24h || [], changes1h || []);

      return {
        totalChanges: allChanges?.length || 0,
        changesLast24h: changes24h?.length || 0,
        changesLast1h: changes1h?.length || 0,
        avgChangesPerSession: this.calculateAvgChangesPerSession(allChanges || []),
        suspiciousActivity,
        riskScore
      };

    } catch (error) {
      console.error('Get demo usage stats error:', error);
      return {
        totalChanges: 0,
        changesLast24h: 0,
        changesLast1h: 0,
        avgChangesPerSession: 0,
        suspiciousActivity: false,
        riskScore: 0
      };
    }
  }

  private async detectAbuse(
    demoUserId: string, 
    usageStats: DemoUsageStats, 
    changeType: string
  ): Promise<AbuseDetectionResult> {
    const reasons: string[] = [];
    let riskScore = usageStats.riskScore;

    // Check for rapid changes
    if (usageStats.changesLast1h > DemoUserManager.ABUSE_THRESHOLDS.rapidChanges) {
      reasons.push('Too many changes in the last hour');
      riskScore += 25;
    }

    // Check for high daily volume
    if (usageStats.changesLast24h > DemoUserManager.DEMO_LIMITS.maxChangesPerDay) {
      reasons.push('Exceeded daily change limit');
      riskScore += 30;
    }

    // Check for bot-like behavior
    if (usageStats.suspiciousActivity) {
      reasons.push('Suspicious activity patterns detected');
      riskScore += 20;
    }

    // Check for session abuse
    const recentChanges = await this.getRecentChanges(demoUserId, 5); // last 5 minutes
    if (recentChanges.length > DemoUserManager.ABUSE_THRESHOLDS.rapidChanges / 4) {
      reasons.push('Too many rapid changes');
      riskScore += 35;
    }

    // Determine action based on risk score
    let action: 'allow' | 'warn' | 'throttle' | 'block' = 'allow';
    let cooldownMinutes: number | undefined;

    if (riskScore >= 90) {
      action = 'block';
    } else if (riskScore >= 70) {
      action = 'throttle';
      cooldownMinutes = Math.min(60, Math.floor(riskScore / 10));
    } else if (riskScore >= 50) {
      action = 'warn';
    }

    return {
      isAbusive: reasons.length > 0,
      riskScore: Math.min(100, riskScore),
      reasons,
      action,
      cooldownMinutes
    };
  }

  private detectSuspiciousPatterns(changes: any[]): boolean {
    if (changes.length < 10) return false;

    // Check for highly repetitive patterns
    const changeTypes = changes.map(c => c.change_type);
    const uniqueTypes = new Set(changeTypes);
    
    // If 90% of changes are the same type, it's suspicious
    const mostCommonType = [...uniqueTypes].reduce((a, b) => 
      changeTypes.filter(t => t === a).length > changeTypes.filter(t => t === b).length ? a : b
    );
    
    const mostCommonCount = changeTypes.filter(t => t === mostCommonType).length;
    if (mostCommonCount / changes.length > 0.9) {
      return true;
    }

    // Check for unnaturally regular intervals
    const timestamps = changes.map(c => new Date(c.created_at).getTime());
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i-1]);
    }

    if (intervals.length > 5) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      
      // If intervals are too regular (low variance), it's suspicious
      if (stdDev / avgInterval < 0.1 && avgInterval < 30000) { // Less than 30 seconds
        return true;
      }
    }

    return false;
  }

  private calculateRiskScore(allChanges: any[], changes24h: any[], changes1h: any[]): number {
    let score = 0;

    // Base score from volume
    score += Math.min(30, (changes24h.length / DemoUserManager.DEMO_LIMITS.maxChangesPerDay) * 30);
    score += Math.min(20, (changes1h.length / DemoUserManager.DEMO_LIMITS.maxChangesPerHour) * 20);

    // Pattern-based scoring
    if (this.detectSuspiciousPatterns(allChanges)) {
      score += 25;
    }

    // Frequency-based scoring
    if (changes1h.length > 0) {
      const avgInterval = (60 * 60 * 1000) / changes1h.length; // ms between changes
      if (avgInterval < 60000) { // Less than 1 minute between changes
        score += 15;
      }
    }

    return Math.min(100, score);
  }

  private calculateAvgChangesPerSession(changes: any[]): number {
    if (changes.length === 0) return 0;

    // Group changes by session (30-minute gaps indicate new session)
    const sessions: any[][] = [];
    let currentSession: any[] = [];
    
    const sortedChanges = changes.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (let i = 0; i < sortedChanges.length; i++) {
      if (currentSession.length === 0) {
        currentSession.push(sortedChanges[i]);
      } else {
        const lastChange = currentSession[currentSession.length - 1];
        const timeDiff = new Date(sortedChanges[i].created_at).getTime() - 
                        new Date(lastChange.created_at).getTime();
        
        if (timeDiff > DemoUserManager.DEMO_LIMITS.sessionTimeoutMinutes * 60 * 1000) {
          sessions.push(currentSession);
          currentSession = [sortedChanges[i]];
        } else {
          currentSession.push(sortedChanges[i]);
        }
      }
    }

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    const totalChanges = sessions.reduce((sum, session) => sum + session.length, 0);
    return totalChanges / sessions.length;
  }

  private async getRecentChanges(demoUserId: string, minutes: number): Promise<any[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    
    const { data: changes } = await this.supabase
      .from('demo_user_changes')
      .select('*')
      .eq('demo_user_id', demoUserId)
      .gte('created_at', cutoff.toISOString());

    return changes || [];
  }

  private async blockDemoUser(demoUserId: string, reason: string): Promise<void> {
    await this.supabase
      .from('demo_users')
      .update({
        is_blocked: true,
        block_reason: reason,
        blocked_at: new Date().toISOString()
      })
      .eq('id', demoUserId);

    // Log the blocking
    await this.logDemoEvent(demoUserId, 'demo_user_blocked', {
      reason,
      blocked_at: new Date().toISOString()
    });
  }

  private async logDemoEvent(demoUserId: string, eventType: string, eventData: any): Promise<void> {
    await this.supabase
      .from('demo_events')
      .insert({
        demo_user_id: demoUserId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default DemoUserManager;