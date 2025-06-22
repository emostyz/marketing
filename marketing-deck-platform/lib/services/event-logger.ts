import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';

export interface EventLoggerOptions {
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  user_id?: string;
  session_id?: string;
  metadata?: any;
}

export interface SystemEventOptions {
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
}

export class EventLogger {
  private static async getSupabase() {
    return createServerSupabaseClient();
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
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          event_type: eventType,
          event_data: eventData,
          user_id: options.user_id || null,
          session_id: options.session_id || null,
          ip_address: options.ip_address,
          user_agent: options.user_agent,
          metadata: options.metadata || null,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging user event:', error);
      return null;
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    userId: string,
    eventType: string,
    eventData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          event_type: eventType,
          event_data: eventData,
          user_id: userId,
          session_id: options.session_id || null,
          ip_address: options.ip_address,
          user_agent: options.user_agent,
          metadata: options.metadata || null,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging auth event:', error);
      return null;
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
    severity: string = 'info',
    options: SystemEventOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('system_events')
        .insert({
          event_type: eventType,
          event_data: eventData,
          severity,
          ip_address: options.ip_address,
          user_agent: options.user_agent,
          metadata: options.metadata || null,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging system event:', error);
      return null;
    }
  }

  /**
   * Log usage metrics
   */
  static async logUsage(
    userId: string | number,
    usageType: string,
    amount: number = 1,
    metadata: any = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('usage_metrics').insert({
        user_id: userId,
        usage_type: usageType,
        amount,
        metadata,
        created_at: new Date().toISOString()
      });
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
      await supabase.from('slide_edits').insert({
        user_id: userId,
        presentation_id: presentationId,
        slide_id: slideId,
        edit_type: editType,
        edit_data: editData,
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
      await supabase.from('data_uploads').insert({
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
   * Extract client information from request
   */
  static getClientInfo(request: Request): EventLoggerOptions {
    return {
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || undefined
    };
  }

  /**
   * Log page view events
   */
  static async logPageView(
    pageUrl: string,
    pageTitle?: string,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('page_views').insert({
        page_url: pageUrl,
        page_title: pageTitle,
        user_id: options.user_id || null,
        session_id: options.session_id || null,
        ip_address: options.ip_address,
        user_agent: options.user_agent,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log page view:', error);
    }
  }

  /**
   * Log user interaction events
   */
  static async logUserInteraction(
    interactionType: string,
    interactionData: any,
    options: EventLoggerOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('user_interactions').insert({
        interaction_type: interactionType,
        interaction_data: interactionData,
        user_id: options.user_id || null,
        session_id: options.session_id || null,
        ip_address: options.ip_address,
        user_agent: options.user_agent,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log user interaction:', error);
    }
  }

  /**
   * Log error events
   */
  static async logError(
    error: Error | string,
    context?: any,
    options: SystemEventOptions = {}
  ) {
    try {
      const supabase = await this.getSupabase();
      await supabase.from('error_logs').insert({
        error_message: typeof error === 'string' ? error : error.message,
        error_stack: typeof error === 'string' ? null : error.stack,
        context,
        ip_address: options.ip_address,
        user_agent: options.user_agent,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
} 