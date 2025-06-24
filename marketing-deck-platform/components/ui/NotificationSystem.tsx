'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, X, AlertTriangle, Info, Zap, Crown, 
  Clock, Download, Upload, Save, Trash2, Copy,
  Wifi, WifiOff, Shield, Heart
} from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'tier-limit'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  tier?: 'pro' | 'enterprise'
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
  showLoading: (title: string, message?: string) => string
  hideLoading: (id: string) => void
  showTierLimit: (feature: string, currentTier: string, action?: () => void) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

const notificationConfig = {
  success: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    defaultDuration: 4000
  },
  error: {
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    defaultDuration: 6000
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultDuration: 5000
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultDuration: 4000
  },
  loading: {
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    defaultDuration: 0 // Loading notifications don't auto-dismiss
  },
  'tier-limit': {
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultDuration: 8000
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const config = notificationConfig[notification.type]
    const duration = notification.duration ?? config.defaultDuration

    const newNotification: Notification = {
      ...notification,
      id,
      duration
    }

    setNotifications(prev => [...prev, newNotification])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }

    return id
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'success', title, message: message || '', duration })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'error', title, message: message || '', duration })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'warning', title, message: message || '', duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'info', title, message: message || '', duration })
  }

  const showLoading = (title: string, message?: string) => {
    return showNotification({ type: 'loading', title, message: message || '' })
  }

  const hideLoading = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showTierLimit = (feature: string, currentTier: string, action?: () => void) => {
    showNotification({
      type: 'tier-limit',
      title: `${feature} requires an upgrade`,
      message: `You're currently on the ${currentTier} plan. Upgrade to unlock this feature.`,
      action: action ? { label: 'Upgrade Now', onClick: action } : undefined,
      duration: 8000
    })
  }

  const clearAll = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        hideLoading,
        showTierLimit,
        clearAll
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const config = notificationConfig[notification.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
      `}
    >
      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-1 bg-current ${config.color} opacity-30`}
          style={{ transformOrigin: 'left' }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${config.color}`}>
            {notification.type === 'loading' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            ) : (
              <Icon className="w-5 h-5" />
            )}
          </div>

          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
            )}

            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className={`
                    text-sm font-medium underline hover:no-underline transition-all
                    ${config.color}
                  `}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Predefined notification helpers
export const notifications = {
  // File operations
  fileSaved: () => useNotifications().showSuccess('File Saved', 'Your presentation has been saved successfully'),
  fileExported: (format: string) => useNotifications().showSuccess('Export Complete', `Your presentation has been exported as ${format}`),
  fileUploaded: (filename: string) => useNotifications().showSuccess('Upload Complete', `${filename} has been uploaded successfully`),
  
  // Element operations
  elementAdded: (type: string) => useNotifications().showSuccess('Element Added', `${type} element has been added to your slide`),
  elementDeleted: () => useNotifications().showSuccess('Element Deleted', 'The element has been removed from your slide'),
  elementCopied: () => useNotifications().showSuccess('Element Copied', 'Element copied to clipboard'),
  
  // Template operations
  templateApplied: (name: string) => useNotifications().showSuccess('Template Applied', `${name} template has been applied to your presentation`),
  
  // Chart operations
  chartUpdated: () => useNotifications().showSuccess('Chart Updated', 'Your chart has been updated successfully'),
  
  // Collaboration
  presentationShared: () => useNotifications().showSuccess('Presentation Shared', 'Your presentation has been shared successfully'),
  
  // Errors
  saveFailed: () => useNotifications().showError('Save Failed', 'Failed to save your presentation. Please try again.'),
  exportFailed: () => useNotifications().showError('Export Failed', 'Failed to export your presentation. Please try again.'),
  uploadFailed: () => useNotifications().showError('Upload Failed', 'Failed to upload the file. Please check the file format and try again.'),
  networkError: () => useNotifications().showError('Connection Error', 'Please check your internet connection and try again.'),
  
  // Warnings
  unsavedChanges: () => useNotifications().showWarning('Unsaved Changes', 'You have unsaved changes. Make sure to save before leaving.'),
  largeFile: () => useNotifications().showWarning('Large File', 'This file is quite large and may take longer to process.'),
  
  // Tier limits
  presentationLimit: (action?: () => void) => useNotifications().showTierLimit('More Presentations', 'Free', action),
  slideLimit: (action?: () => void) => useNotifications().showTierLimit('More Slides', 'Free', action),
  exportLimit: (action?: () => void) => useNotifications().showTierLimit('Advanced Export', 'Free', action),
  collaborationLimit: (action?: () => void) => useNotifications().showTierLimit('Team Collaboration', 'Free', action),
  
  // Loading states
  saving: () => useNotifications().showLoading('Saving...', 'Your presentation is being saved'),
  exporting: () => useNotifications().showLoading('Exporting...', 'Your presentation is being prepared for download'),
  analyzing: () => useNotifications().showLoading('Analyzing Data...', 'AI is analyzing your data to create insights'),
  generating: () => useNotifications().showLoading('Generating Presentation...', 'Creating your professional presentation')
}