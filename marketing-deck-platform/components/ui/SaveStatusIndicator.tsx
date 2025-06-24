'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  CloudOff, 
  Save, 
  Check, 
  AlertCircle, 
  Loader2,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved?: Date | null
  lastError?: string | null
  hasUnsavedChanges?: boolean
  onForceSave?: () => void
  className?: string
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  lastError,
  hasUnsavedChanges = false,
  onForceSave,
  className = ''
}: SaveStatusIndicatorProps) {
  
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          color: 'bg-blue-500 text-white',
          iconProps: { className: 'w-4 h-4 animate-spin' },
          tooltip: 'Saving changes to cloud'
        }
      
      case 'saved':
        return {
          icon: Check,
          text: hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved',
          color: hasUnsavedChanges ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white',
          iconProps: { className: 'w-4 h-4' },
          tooltip: hasUnsavedChanges 
            ? 'New changes detected - will auto-save soon' 
            : lastSaved 
              ? `Last saved: ${formatTime(lastSaved)}`
              : 'All changes saved'
        }
      
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          color: 'bg-red-500 text-white',
          iconProps: { className: 'w-4 h-4' },
          tooltip: lastError || 'Failed to save changes - click to retry'
        }
      
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          color: 'bg-gray-500 text-white',
          iconProps: { className: 'w-4 h-4' },
          tooltip: 'No internet connection - changes will be saved when reconnected'
        }
      
      default: // idle
        return {
          icon: Cloud,
          text: hasUnsavedChanges ? 'Unsaved changes' : 'Up to date',
          color: hasUnsavedChanges ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white',
          iconProps: { className: 'w-4 h-4' },
          tooltip: hasUnsavedChanges 
            ? 'Changes detected - will auto-save in a few seconds'
            : 'No unsaved changes'
        }
    }
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffSecs = Math.floor(diffMs / 1000)

    if (diffSecs < 60) {
      return 'just now'
    } else if (diffMins < 60) {
      return `${diffMins}m ago`
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <TooltipProvider>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge 
                variant="secondary" 
                className={`${config.color} cursor-pointer transition-all hover:shadow-md ${
                  status === 'error' && onForceSave ? 'hover:bg-red-600' : ''
                }`}
                onClick={status === 'error' && onForceSave ? onForceSave : undefined}
              >
                <Icon {...config.iconProps} />
                <span className="ml-2 text-xs font-medium">{config.text}</span>
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{config.tooltip}</p>
              {status === 'error' && onForceSave && (
                <p className="text-xs text-gray-300 mt-1">Click to retry</p>
              )}
              {lastSaved && status !== 'error' && (
                <p className="text-xs text-gray-300 mt-1">
                  Last saved: {formatTime(lastSaved)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Pulse indicator for unsaved changes */}
        <AnimatePresence>
          {hasUnsavedChanges && status !== 'saving' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Force save button for error state */}
        {status === 'error' && onForceSave && (
          <Button
            size="sm"
            variant="outline"
            onClick={onForceSave}
            className="h-6 px-2 text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}

        {/* Connection status for offline */}
        {status === 'offline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-1"
          >
            <WifiOff className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">No connection</span>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Compact version for toolbar use
export function CompactSaveStatus({
  status,
  lastSaved,
  hasUnsavedChanges = false,
  onForceSave,
  className = ''
}: SaveStatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'saved':
        return hasUnsavedChanges 
          ? <Clock className="w-4 h-4 text-yellow-500" />
          : <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-500" />
      default:
        return hasUnsavedChanges 
          ? <Clock className="w-4 h-4 text-yellow-500" />
          : <Cloud className="w-4 h-4 text-gray-400" />
    }
  }

  const getTooltip = () => {
    switch (status) {
      case 'saving':
        return 'Saving changes...'
      case 'saved':
        return hasUnsavedChanges 
          ? 'New changes detected'
          : lastSaved 
            ? `Saved ${formatTime(lastSaved)}`
            : 'All changes saved'
      case 'error':
        return 'Save failed - click to retry'
      case 'offline':
        return 'Offline - will save when reconnected'
      default:
        return hasUnsavedChanges ? 'Will auto-save soon' : 'Up to date'
    }
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={status === 'error' && onForceSave ? onForceSave : undefined}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
          >
            {getIcon()}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}