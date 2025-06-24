/**
 * Authentication Error Display Component
 * Provides beautiful, user-friendly error UX with recovery actions
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, X, HelpCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type AuthError } from '@/lib/auth/error-handler'

interface AuthErrorProps {
  error: string
  authError?: AuthError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

const severityConfig = {
  low: {
    icon: HelpCircle,
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700/50',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-200'
  },
  medium: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-700/50',
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-200'
  },
  high: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-700/50',
    iconColor: 'text-orange-400',
    textColor: 'text-orange-200'
  },
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-700/50',
    iconColor: 'text-red-400',
    textColor: 'text-red-200'
  }
}

const categoryTitles = {
  auth: 'Authentication Issue',
  network: 'Connection Problem',
  validation: 'Input Validation',
  demo: 'Demo Setup Issue',
  oauth: 'Social Login Problem',
  system: 'System Error'
}

export function AuthError({ error, authError, onRetry, onDismiss, className }: AuthErrorProps) {
  if (!error && !authError) return null

  const severity = authError?.severity || 'medium'
  const category = authError?.category || 'auth'
  const config = severityConfig[severity]
  const IconComponent = config.icon

  const handleRecoveryAction = (action: string) => {
    switch (action) {
      case 'retry':
      case 'retry_demo':
      case 'retry_oauth':
        onRetry?.()
        break
      case 'refresh_page':
        window.location.reload()
        break
      case 'create_account':
        window.location.href = '/auth/signup'
        break
      case 'sign_in':
        window.location.href = '/auth/login'
        break
      case 'reset_password':
        // This would typically open a reset password modal
        console.log('Password reset requested')
        break
      case 'contact_support':
        window.open('mailto:support@aedrin.com?subject=Authentication Issue&body=' + 
          encodeURIComponent(`I'm experiencing an authentication issue:\n\nError: ${error}\n\nPlease help me resolve this.`))
        break
      case 'status_page':
        window.open('https://status.aedrin.com', '_blank')
        break
      case 'clear_cookies':
        // Clear cookies and reload
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
        })
        window.location.reload()
        break
      default:
        console.log(`Recovery action not implemented: ${action}`)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={`${config.iconColor} mt-0.5 flex-shrink-0`}
          >
            <IconComponent className="w-5 h-5" />
          </motion.div>

          {/* Error Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Dismiss Button */}
            <div className="flex items-start justify-between mb-2">
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`font-semibold ${config.textColor}`}
              >
                {categoryTitles[category]}
              </motion.h4>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${config.iconColor} hover:text-white transition-colors ml-2 flex-shrink-0`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error Message */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm ${config.textColor} mb-3 leading-relaxed`}
            >
              {authError?.userMessage || error}
            </motion.p>

            {/* Recovery Actions */}
            {authError?.recovery && authError.recovery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <p className="text-xs text-gray-400 font-medium">What you can do:</p>
                <div className="flex flex-wrap gap-2">
                  {authError.recovery.slice(0, 3).map((recovery, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecoveryAction(recovery.action)}
                      className={`text-xs ${config.borderColor} ${config.textColor} hover:bg-white/10 hover:text-white border-opacity-50`}
                    >
                      {recovery.action === 'retry' && <RefreshCw className="w-3 h-3 mr-1" />}
                      {recovery.action.includes('contact') && <ExternalLink className="w-3 h-3 mr-1" />}
                      {recovery.message}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Additional Help for Critical Errors */}
            {severity === 'critical' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 p-2 bg-black/20 rounded border border-white/10"
              >
                <p className="text-xs text-gray-300">
                  This appears to be a serious issue. Our team has been automatically notified.
                  {' '}
                  <button
                    onClick={() => handleRecoveryAction('contact_support')}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Contact support
                  </button>
                  {' '}if you need immediate assistance.
                </p>
              </motion.div>
            )}

            {/* Error Code (Development) */}
            {process.env.NODE_ENV === 'development' && authError?.code && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-2 text-xs text-gray-500"
              >
                Error Code: {authError.code}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing auth errors
export function useAuthError() {
  const [authError, setAuthError] = React.useState<{
    error: string
    authError?: AuthError
  } | null>(null)

  const showError = React.useCallback((error: string, authErrorObj?: AuthError) => {
    setAuthError({ error, authError: authErrorObj })
  }, [])

  const clearError = React.useCallback(() => {
    setAuthError(null)
  }, [])

  const retryAction = React.useCallback(() => {
    // This would be customized based on the context
    clearError()
  }, [clearError])

  return {
    authError,
    showError,
    clearError,
    retryAction
  }
}