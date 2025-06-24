'use client'

/**
 * Client-side analytics and event tracking
 * This sends user interaction events to our analytics API
 */

interface TrackingEvent {
  event_type: string
  event_data: any
  metadata?: any
}

export class ClientTracker {
  private static userId: string | null = null
  private static sessionId: string = ''

  static init(userId?: string) {
    this.userId = userId || null
    this.sessionId = this.generateSessionId()
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track user interactions (clicks, navigation, etc.)
   */
  static async trackUserInteraction(
    interactionType: string,
    data: any = {},
    metadata: any = {}
  ) {
    try {
      await fetch('/api/analytics/user-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: interactionType,
          event_data: {
            ...data,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            page_url: window.location.href,
            page_title: document.title
          },
          metadata: {
            ...metadata,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })
    } catch (error) {
      console.warn('Failed to track user interaction:', error)
    }
  }

  /**
   * Track page views
   */
  static async trackPageView(pagePath: string, pageTitle?: string) {
    try {
      await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_path: pagePath,
          page_title: pageTitle || document.title,
          referrer: document.referrer,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.warn('Failed to track page view:', error)
    }
  }

  /**
   * Track presentation-specific events
   */
  static async trackPresentationEvent(
    eventType: 'created' | 'opened' | 'edited' | 'exported' | 'deleted' | 'shared',
    presentationId: string,
    additionalData: any = {}
  ) {
    await this.trackUserInteraction(`presentation_${eventType}`, {
      presentation_id: presentationId,
      ...additionalData
    })
  }

  /**
   * Track file upload events
   */
  static async trackFileUpload(
    fileName: string,
    fileSize: number,
    fileType: string,
    uploadSuccess: boolean,
    errorMessage?: string
  ) {
    await this.trackUserInteraction('file_upload', {
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      success: uploadSuccess,
      error_message: errorMessage
    })
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUsage(
    featureName: string,
    action: string,
    additionalData: any = {}
  ) {
    await this.trackUserInteraction('feature_usage', {
      feature_name: featureName,
      action,
      ...additionalData
    })
  }

  /**
   * Track errors and performance issues
   */
  static async trackError(
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    context?: any
  ) {
    await this.trackUserInteraction('client_error', {
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      context
    })
  }

  /**
   * Track user engagement metrics
   */
  static async trackEngagement(
    action: 'session_start' | 'session_end' | 'feature_discovery' | 'help_accessed',
    data: any = {}
  ) {
    await this.trackUserInteraction(`engagement_${action}`, data)
  }
}

// Auto-track page views on navigation
if (typeof window !== 'undefined') {
  // Track initial page load
  window.addEventListener('load', () => {
    ClientTracker.trackPageView(window.location.pathname)
  })

  // Track page navigation (for SPAs)
  let currentPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname
      ClientTracker.trackPageView(currentPath)
    }
  })

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}