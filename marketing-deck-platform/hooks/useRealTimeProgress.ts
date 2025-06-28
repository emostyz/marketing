'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface ProgressUpdate {
  stage: string
  message: string
  progress: number
  timestamp: Date
  error?: string
  data?: any
}

export interface UseRealTimeProgressOptions {
  pollInterval?: number // ms
  autoStart?: boolean
  maxRetries?: number
}

export function useRealTimeProgress(
  endpoint: string,
  options: UseRealTimeProgressOptions = {}
) {
  const {
    pollInterval = 1000,
    autoStart = false,
    maxRetries = 3
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const pollInterval_ref = useRef<NodeJS.Timeout | null>(null)
  const retryCount = useRef(0)
  const isActive = useRef(false)

  const stopPolling = useCallback(() => {
    if (pollInterval_ref.current) {
      clearInterval(pollInterval_ref.current)
      pollInterval_ref.current = null
    }
    isActive.current = false
  }, [])

  const fetchProgress = useCallback(async () => {
    if (!isActive.current) return

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Reset retry count on successful fetch
      retryCount.current = 0

      if (data.error) {
        setError(data.error)
        setIsLoading(false)
        stopPolling()
        return
      }

      const progressUpdate: ProgressUpdate = {
        stage: data.stage || 'Processing',
        message: data.message || 'Processing your request...',
        progress: data.progress || 0,
        timestamp: new Date(data.timestamp || Date.now()),
        data: data.data
      }

      setProgress(progressUpdate)

      // Check if complete
      if (data.status === 'completed' || data.progress >= 100) {
        setIsComplete(true)
        setIsLoading(false)
        stopPolling()
      } else if (data.status === 'failed') {
        setError(data.error || 'Process failed')
        setIsLoading(false)
        stopPolling()
      }

    } catch (err) {
      console.error('Progress fetch error:', err)
      retryCount.current++

      if (retryCount.current >= maxRetries) {
        setError(err instanceof Error ? err.message : 'Failed to fetch progress')
        setIsLoading(false)
        stopPolling()
      }
      // Continue polling for transient errors within retry limit
    }
  }, [endpoint, maxRetries, stopPolling])

  const startPolling = useCallback(() => {
    if (isActive.current) return // Already polling

    isActive.current = true
    setIsLoading(true)
    setError(null)
    setIsComplete(false)
    retryCount.current = 0

    // Immediate fetch
    fetchProgress()

    // Start polling
    pollInterval_ref.current = setInterval(fetchProgress, pollInterval)
  }, [fetchProgress, pollInterval])

  const reset = useCallback(() => {
    stopPolling()
    setIsLoading(false)
    setProgress(null)
    setError(null)
    setIsComplete(false)
    retryCount.current = 0
  }, [stopPolling])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [autoStart, startPolling, stopPolling])

  return {
    isLoading,
    progress,
    error,
    isComplete,
    startPolling,
    stopPolling,
    reset
  }
}

export default useRealTimeProgress