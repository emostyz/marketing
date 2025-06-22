import { createServerClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

export interface EventLoggerOptions {
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  user_id?: string | number;
  session_id?: string;
}

export class EventLogger {
  private static async getSupabase() {
    return await createServerClient();
  }

  /**
   * Log user events (user actions, interactions, etc.)
   */
  static async logUserEvent(
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('user_events').insert({
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        referer: options.referer || 'unknown',
        user_id: options.user_id || null,
        session_id: options.session_id || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log user event:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    userId: string | number,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('auth_events').insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        session_id: options.session_id || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  /**
   * Log profile change events
   */
  static async logProfileEvent(
    userId: string | number,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('profile_events').insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log profile event:', error);
    }
  }

  /**
   * Log subscription events
   */
  static async logSubscriptionEvent(
    userId: string | number,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('subscription_events').insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log subscription event:', error);
    }
  }

  /**
   * Log payment events
   */
  static async logPaymentEvent(
    eventType: string,
    eventData: any,
    stripeEventId?: string
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('payment_events').insert({
        event_type: eventType,
        event_data: eventData,
        stripe_event_id: stripeEventId || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log payment event:', error);
    }
  }

  /**
   * Log lead events
   */
  static async logLeadEvent(
    leadId: string | number,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('lead_events').insert({
        lead_id: leadId,
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log lead event:', error);
    }
  }

  /**
   * Log system events (errors, warnings, etc.)
   */
  static async logSystemEvent(
    eventType: string,
    eventData: any,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('system_events').insert({
        event_type: eventType,
        event_data: eventData,
        severity,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  /**
   * Log usage tracking
   */
  static async logUsage(
    userId: string | number,
    usageType: string,
    amount: number = 1,
    metadata: any = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      // Get current usage
      const { data: currentUsage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();

      if (currentUsage) {
        // Update existing usage
        const updateData: any = {};
        updateData[usageType] = (currentUsage[usageType] || 0) + amount;
        
        await supabase
          .from('usage_tracking')
          .update(updateData)
          .eq('user_id', userId)
          .eq('month_year', currentMonth);
      } else {
        // Create new usage record
        const newUsage: any = {
          user_id: userId,
          month_year: currentMonth,
          metadata
        };
        newUsage[usageType] = amount;
        
        await supabase
          .from('usage_tracking')
          .insert(newUsage);
      }
    } catch (error) {
      console.error('Failed to log usage:', error);
    }
  }

  /**
   * Log slide edit events
   */
  static async logSlideEdit(
    userId: string | number,
    presentationId: string | number,
    slideId: string | number,
    editType: string,
    editData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('slide_events').insert({
        user_id: userId,
        presentation_id: presentationId,
        slide_id: slideId,
        event_type: editType,
        event_data: editData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log slide edit:', error);
    }
  }

  /**
   * Log presentation events
   */
  static async logPresentationEvent(
    userId: string | number,
    presentationId: string | number,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('presentation_events').insert({
        user_id: userId,
        presentation_id: presentationId,
        event_type: eventType,
        event_data: eventData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log presentation event:', error);
    }
  }

  /**
   * Log data upload events
   */
  static async logDataUpload(
    userId: string | number,
    fileId: string,
    fileName: string,
    fileSize: number,
    dataType: string,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('data_upload_events').insert({
        user_id: userId,
        file_id: fileId,
        file_name: fileName,
        file_size: fileSize,
        data_type: dataType,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log data upload:', error);
    }
  }

  /**
   * Log export events
   */
  static async logExportEvent(
    userId: string | number,
    presentationId: string | number,
    exportType: string,
    exportData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('export_events').insert({
        user_id: userId,
        presentation_id: presentationId,
        export_type: exportType,
        export_data: exportData,
        ip_address: options.ip_address || 'unknown',
        user_agent: options.user_agent || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log export event:', error);
    }
  }

  /**
   * Get client information from request
   */
  static getClientInfo(request: Request): EventLoggerOptions {
    const url = new URL(request.url);
    return {
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || url.origin
    };
  }
} 