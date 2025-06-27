'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { toast } from 'react-hot-toast'

interface AutoSaveOptions {
  enabled?: boolean
  interval?: number // milliseconds
  debounceDelay?: number // milliseconds
  onSaveStart?: () => void
  onSaveSuccess?: (data: any) => void
  onSaveError?: (error: Error) => void
  conflictResolution?: 'auto' | 'manual' | 'prompt'
}

interface SaveStatus {
  lastSaved: Date | null
  isSaving: boolean
  hasUnsavedChanges: boolean
  saveError: string | null
  saveCount: number
  conflictDetected: boolean
}

interface ConflictData {
  localVersion: any
  serverVersion: any
  conflictType: 'version' | 'timestamp' | 'data'
  resolution?: 'local' | 'server' | 'merge'
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<any>,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    interval = 5000, // 5 seconds for frequent auto-saves
    debounceDelay = 100, // 100ms for near-instant saves
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    conflictResolution = 'prompt'
  } = options

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false,
    saveError: null,
    saveCount: 0,
    conflictDetected: false
  })

  const [conflictData, setConflictData] = useState<ConflictData | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Track if data has changed since last save
  const [lastSavedData, setLastSavedData] = useState<T | null>(null)

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (dataToSave: T) => {
      if (!enabled || saveStatus.isSaving) return

      setSaveStatus(prev => ({ 
        ...prev, 
        isSaving: true, 
        saveError: null 
      }))

      try {
        onSaveStart?.()

        const result = await saveFunction(dataToSave)
        
        setSaveStatus(prev => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
          saveCount: prev.saveCount + 1,
          conflictDetected: false
        }))

        setLastSavedData(dataToSave)
        onSaveSuccess?.(result)

        // Show subtle success indicator for instant feedback
        toast.success('Auto-saved', {
          duration: 800,
          position: 'bottom-right',
          style: {
            fontSize: '11px',
            padding: '6px 10px',
            backgroundColor: '#10b981',
            color: 'white'
          }
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed'
        
        setSaveStatus(prev => ({
          ...prev,
          isSaving: false,
          saveError: errorMessage,
          hasUnsavedChanges: true
        }))

        // Handle different types of errors
        if (errorMessage.includes('409') || errorMessage.includes('conflict')) {
          await handleConflict(error, dataToSave)
        } else {
          onSaveError?.(error instanceof Error ? error : new Error(errorMessage))
          
          toast.error(`Auto-save failed: ${errorMessage}`, {
            duration: 3000,
            position: 'bottom-right',
            style: {
              backgroundColor: '#ef4444',
              color: 'white'
            },
            action: {
              label: 'Retry',
              onClick: () => debouncedSave(dataToSave)
            }
          })
        }
      }
    }, debounceDelay),
    [enabled, saveFunction, debounceDelay, onSaveStart, onSaveSuccess, onSaveError, saveStatus.isSaving]
  )

  // Handle save conflicts
  const handleConflict = useCallback(async (error: any, localData: T) => {
    setSaveStatus(prev => ({ ...prev, conflictDetected: true }))

    try {
      // Extract server version from error response
      const serverVersion = error.serverData || error.response?.data
      
      const conflict: ConflictData = {
        localVersion: localData,
        serverVersion,
        conflictType: 'version'
      }

      setConflictData(conflict)

      switch (conflictResolution) {
        case 'auto':
          // Auto-merge or take server version
          await resolveConflict('server')
          break
        
        case 'manual':
          // Let user handle it manually
          toast.error('Save conflict detected. Please resolve manually.', {
            duration: 0, // Don't auto-dismiss
            position: 'top-center'
          })
          break
        
        case 'prompt':
          // Show conflict resolution dialog
          const resolution = await promptConflictResolution(conflict)
          if (resolution) {
            await resolveConflict(resolution)
          }
          break
      }
    } catch (conflictError) {
      console.error('Error handling save conflict:', conflictError)
      toast.error('Failed to resolve save conflict')
    }
  }, [conflictResolution])

  // Resolve conflict with chosen strategy
  const resolveConflict = useCallback(async (resolution: 'local' | 'server' | 'merge') => {
    if (!conflictData) return

    try {
      let resolvedData: T

      switch (resolution) {
        case 'local':
          resolvedData = conflictData.localVersion
          break
        case 'server':
          resolvedData = conflictData.serverVersion
          break
        case 'merge':
          resolvedData = mergeConflictData(conflictData.localVersion, conflictData.serverVersion)
          break
      }

      // Force save with conflict resolution
      await saveFunction(resolvedData)
      
      setSaveStatus(prev => ({
        ...prev,
        conflictDetected: false,
        hasUnsavedChanges: false,
        lastSaved: new Date()
      }))

      setConflictData(null)
      setLastSavedData(resolvedData)

      toast.success(`Conflict resolved (${resolution})`, {
        duration: 2000
      })

    } catch (error) {
      console.error('Error resolving conflict:', error)
      toast.error('Failed to resolve conflict')
    }
  }, [conflictData, saveFunction])

  // Simple merge strategy (can be customized)
  const mergeConflictData = useCallback((local: T, server: T): T => {
    // Basic merge - prefer local changes for most fields
    // This should be customized based on your data structure
    return {
      ...server,
      ...local,
      lastModified: new Date().toISOString()
    } as T
  }, [])

  // Prompt user for conflict resolution
  const promptConflictResolution = useCallback(async (conflict: ConflictData): Promise<'local' | 'server' | 'merge' | null> => {
    return new Promise((resolve) => {
      // In a real app, you'd show a modal dialog here
      const choice = window.confirm(
        'Save conflict detected. Your changes may overwrite recent changes by others.\n\n' +
        'Click OK to keep your changes, or Cancel to use the server version.'
      )
      resolve(choice ? 'local' : 'server')
    })
  }, [])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (data && !saveStatus.isSaving) {
      debouncedSave.cancel() // Cancel any pending debounced save
      setSaveStatus(prev => ({ ...prev, isSaving: true }))
      await debouncedSave(data)
    }
  }, [data, debouncedSave, saveStatus.isSaving])

  // Check if data has changed
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      setLastSavedData(data)
      return
    }

    if (enabled && data && JSON.stringify(data) !== JSON.stringify(lastSavedData)) {
      setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }))
      
      if (data) {
        debouncedSave(data)
      }
    }
  }, [data, lastSavedData, enabled, debouncedSave, isInitialized])

  // Periodic save (backup)
  useEffect(() => {
    if (!enabled || interval <= 0) return

    const intervalId = setInterval(() => {
      if (saveStatus.hasUnsavedChanges && data && !saveStatus.isSaving) {
        debouncedSave(data)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [enabled, interval, saveStatus.hasUnsavedChanges, data, saveStatus.isSaving, debouncedSave])

  // Save on page unload
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        
        // Try to save synchronously (may not work in all browsers)
        if (data) {
          navigator.sendBeacon('/api/save', JSON.stringify(data))
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && saveStatus.hasUnsavedChanges && data) {
        // Save when tab becomes hidden
        debouncedSave(data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, saveStatus.hasUnsavedChanges, data, debouncedSave])

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  return {
    ...saveStatus,
    saveNow,
    conflictData,
    resolveConflict,
    clearError: () => setSaveStatus(prev => ({ ...prev, saveError: null })),
    
    // Utility functions
    getTimeSinceLastSave: () => {
      if (!saveStatus.lastSaved) return null
      return Date.now() - saveStatus.lastSaved.getTime()
    },
    
    getStatusText: () => {
      if (saveStatus.isSaving) return 'Saving...'
      if (saveStatus.saveError) return 'Save failed'
      if (saveStatus.conflictDetected) return 'Conflict detected'
      if (saveStatus.hasUnsavedChanges) return 'Unsaved changes'
      if (saveStatus.lastSaved) {
        const timeSince = Date.now() - saveStatus.lastSaved.getTime()
        if (timeSince < 60000) return 'Saved just now'
        if (timeSince < 3600000) return `Saved ${Math.floor(timeSince / 60000)}m ago`
        return `Saved ${Math.floor(timeSince / 3600000)}h ago`
      }
      return 'Not saved'
    }
  }
}

export default useAutoSave