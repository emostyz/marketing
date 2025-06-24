/**
 * Authentication Error Handler
 * Provides user-friendly error messages and comprehensive error handling
 */

export interface AuthError {
  code: string
  message: string
  userMessage: string
  category: 'auth' | 'network' | 'validation' | 'demo' | 'oauth' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  recovery: {
    action: string
    message: string
  }[]
}

export class AuthErrorHandler {
  private static readonly ERROR_MAPPINGS: Record<string, AuthError> = {
    // Supabase Auth Errors
    'Invalid login credentials': {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid login credentials',
      userMessage: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      category: 'auth',
      severity: 'medium',
      recovery: [
        { action: 'double_check', message: 'Double-check your email and password' },
        { action: 'reset_password', message: 'Reset your password if you\'ve forgotten it' },
        { action: 'contact_support', message: 'Contact support if you continue having issues' }
      ]
    },
    'Email not confirmed': {
      code: 'EMAIL_NOT_CONFIRMED',
      message: 'Email not confirmed',
      userMessage: 'Please check your email and click the confirmation link before signing in.',
      category: 'auth',
      severity: 'medium',
      recovery: [
        { action: 'check_email', message: 'Check your email for a confirmation link' },
        { action: 'resend_confirmation', message: 'Request a new confirmation email' },
        { action: 'check_spam', message: 'Check your spam/junk folder' }
      ]
    },
    'User not found': {
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      userMessage: 'No account found with this email address. Would you like to create a new account?',
      category: 'auth',
      severity: 'medium',
      recovery: [
        { action: 'create_account', message: 'Create a new account with this email' },
        { action: 'check_email', message: 'Verify you\'re using the correct email address' },
        { action: 'try_oauth', message: 'Try signing in with Google or GitHub' }
      ]
    },
    'Email rate limit exceeded': {
      code: 'EMAIL_RATE_LIMIT',
      message: 'Email rate limit exceeded',
      userMessage: 'Too many email requests. Please wait a few minutes before trying again.',
      category: 'auth',
      severity: 'medium',
      recovery: [
        { action: 'wait', message: 'Wait 5-10 minutes before trying again' },
        { action: 'try_different_method', message: 'Try signing in with OAuth instead' },
        { action: 'contact_support', message: 'Contact support if this persists' }
      ]
    },
    'Password should be at least 6 characters': {
      code: 'PASSWORD_TOO_SHORT',
      message: 'Password should be at least 6 characters',
      userMessage: 'Your password must be at least 6 characters long. Please choose a stronger password.',
      category: 'validation',
      severity: 'low',
      recovery: [
        { action: 'longer_password', message: 'Use a password with at least 6 characters' },
        { action: 'mix_characters', message: 'Include letters, numbers, and symbols' },
        { action: 'password_manager', message: 'Consider using a password manager' }
      ]
    },
    'User already registered': {
      code: 'USER_EXISTS',
      message: 'User already registered',
      userMessage: 'An account with this email already exists. Please sign in instead.',
      category: 'auth',
      severity: 'medium',
      recovery: [
        { action: 'sign_in', message: 'Go to sign in page' },
        { action: 'reset_password', message: 'Reset password if you\'ve forgotten it' },
        { action: 'try_oauth', message: 'Try signing in with Google or GitHub' }
      ]
    },

    // Network Errors
    'fetch failed': {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
      category: 'network',
      severity: 'high',
      recovery: [
        { action: 'check_connection', message: 'Check your internet connection' },
        { action: 'retry', message: 'Try again in a few moments' },
        { action: 'refresh_page', message: 'Refresh the page' }
      ]
    },
    'timeout': {
      code: 'REQUEST_TIMEOUT',
      message: 'Request timed out',
      userMessage: 'The request is taking longer than expected. This might be due to slow connectivity.',
      category: 'network',
      severity: 'medium',
      recovery: [
        { action: 'retry', message: 'Try again with a stable connection' },
        { action: 'wait', message: 'Wait a moment and try again' },
        { action: 'check_status', message: 'Check our status page for any known issues' }
      ]
    },

    // Demo Errors
    'Demo setup failed': {
      code: 'DEMO_SETUP_FAILED',
      message: 'Demo mode setup failed',
      userMessage: 'We\'re having trouble setting up the demo. Please try again or create a free account.',
      category: 'demo',
      severity: 'medium',
      recovery: [
        { action: 'retry_demo', message: 'Try the demo again' },
        { action: 'create_account', message: 'Create a free account instead' },
        { action: 'contact_support', message: 'Contact support if this continues' }
      ]
    },
    'Demo expired': {
      code: 'DEMO_EXPIRED',
      message: 'Demo session expired',
      userMessage: 'Your demo session has expired. Create a free account to continue using AEDRIN.',
      category: 'demo',
      severity: 'low',
      recovery: [
        { action: 'create_account', message: 'Create a free account' },
        { action: 'start_new_demo', message: 'Start a new demo session' },
        { action: 'learn_more', message: 'Learn more about our plans' }
      ]
    },

    // OAuth Errors
    'OAuth error': {
      code: 'OAUTH_ERROR',
      message: 'OAuth authentication failed',
      userMessage: 'There was a problem with social login. Please try again or use email/password.',
      category: 'oauth',
      severity: 'medium',
      recovery: [
        { action: 'retry_oauth', message: 'Try the social login again' },
        { action: 'use_email', message: 'Use email and password instead' },
        { action: 'clear_cookies', message: 'Clear cookies and try again' }
      ]
    },
    'OAuth cancelled': {
      code: 'OAUTH_CANCELLED',
      message: 'OAuth was cancelled',
      userMessage: 'Sign in was cancelled. You can try again or use a different method.',
      category: 'oauth',
      severity: 'low',
      recovery: [
        { action: 'retry_oauth', message: 'Try social login again' },
        { action: 'use_email', message: 'Use email and password' },
        { action: 'try_different_provider', message: 'Try a different social provider' }
      ]
    },

    // System Errors
    'Internal server error': {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      userMessage: 'Something went wrong on our end. Our team has been notified and we\'re working on a fix.',
      category: 'system',
      severity: 'critical',
      recovery: [
        { action: 'retry_later', message: 'Try again in a few minutes' },
        { action: 'contact_support', message: 'Contact support with error details' },
        { action: 'status_page', message: 'Check our status page for updates' }
      ]
    },
    'Service unavailable': {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable',
      userMessage: 'Our service is temporarily unavailable. We\'re working to restore it as quickly as possible.',
      category: 'system',
      severity: 'critical',
      recovery: [
        { action: 'wait', message: 'Wait a few minutes and try again' },
        { action: 'status_page', message: 'Check our status page for updates' },
        { action: 'contact_support', message: 'Contact support if this persists' }
      ]
    }
  }

  /**
   * Process an error and return a user-friendly error object
   */
  static processError(error: Error | string | any): AuthError {
    const errorMessage = this.extractErrorMessage(error)
    
    // Find exact match first
    const exactMatch = this.ERROR_MAPPINGS[errorMessage]
    if (exactMatch) {
      return exactMatch
    }

    // Try partial matches
    for (const [key, errorInfo] of Object.entries(this.ERROR_MAPPINGS)) {
      if (errorMessage.includes(key) || key.includes(errorMessage)) {
        return errorInfo
      }
    }

    // Default error for unknown cases
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      category: 'system',
      severity: 'medium',
      recovery: [
        { action: 'retry', message: 'Try the action again' },
        { action: 'refresh_page', message: 'Refresh the page' },
        { action: 'contact_support', message: 'Contact support with error details' }
      ]
    }
  }

  /**
   * Extract error message from various error formats
   */
  private static extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error
    }

    if (error instanceof Error) {
      return error.message
    }

    if (error?.message) {
      return error.message
    }

    if (error?.error) {
      return error.error
    }

    if (error?.error_description) {
      return error.error_description
    }

    return 'Unknown error occurred'
  }

  /**
   * Format error for logging while keeping user-friendly message
   */
  static formatErrorForLogging(error: any, context?: string): {
    userError: AuthError
    logData: Record<string, any>
  } {
    const userError = this.processError(error)
    
    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'auth',
      originalError: this.extractErrorMessage(error),
      errorCode: userError.code,
      category: userError.category,
      severity: userError.severity,
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    return { userError, logData }
  }

  /**
   * Get recovery actions based on error category
   */
  static getRecoveryActions(error: AuthError): string[] {
    return error.recovery.map(r => r.message)
  }

  /**
   * Check if error requires immediate user attention
   */
  static isUrgentError(error: AuthError): boolean {
    return error.severity === 'critical' || error.severity === 'high'
  }

  /**
   * Get appropriate retry delay based on error type
   */
  static getRetryDelay(error: AuthError): number {
    switch (error.category) {
      case 'network':
        return 2000 // 2 seconds
      case 'auth':
        return 1000 // 1 second
      case 'system':
        return 5000 // 5 seconds
      case 'oauth':
        return 1500 // 1.5 seconds
      default:
        return 1000 // 1 second
    }
  }
}