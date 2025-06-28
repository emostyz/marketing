'use client'

import { useState, useEffect } from 'react'
import { Brain, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress'
import { ThinkingAnimation } from './thinking-animation'

interface EnhancedProgressTrackerProps {
  sessionId: string
  onComplete?: (data: any) => void
  onError?: (error: string) => void
  autoStart?: boolean
}

export function EnhancedProgressTracker({
  sessionId,
  onComplete,
  onError,
  autoStart = true
}: EnhancedProgressTrackerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime] = useState(new Date())

  const {
    isLoading,
    progress,
    error,
    isComplete,
    startPolling,
    stopPolling,
    reset
  } = useRealTimeProgress(`/api/ai/progress/${sessionId}`, {
    pollInterval: 1000,
    autoStart,
    maxRetries: 5
  })

  // Update elapsed time
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLoading, startTime])

  // Handle completion and errors
  useEffect(() => {
    if (isComplete && progress?.data && onComplete) {
      onComplete(progress.data)
    }
  }, [isComplete, progress?.data, onComplete])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-6 h-6 text-red-500" />
    if (isComplete) return <CheckCircle2 className="w-6 h-6 text-green-500" />
    if (isLoading) return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    return <Brain className="w-6 h-6 text-gray-400" />
  }

  const getStatusColor = () => {
    if (error) return 'border-red-500/30 bg-red-900/20'
    if (isComplete) return 'border-green-500/30 bg-green-900/20'
    if (isLoading) return 'border-blue-500/30 bg-blue-900/20'
    return 'border-gray-500/30 bg-gray-900/20'
  }

  if (!isLoading && !progress && !error && !isComplete) {
    return (
      <div className="text-center p-4">
        <button
          onClick={startPolling}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Start Tracking Progress
        </button>
      </div>
    )
  }

  return (
    <div className={`border rounded-xl p-6 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {error ? 'Process Failed' : isComplete ? 'Complete!' : 'Processing'}
            </h3>
            <p className="text-gray-400 text-sm">
              Session: {sessionId.slice(0, 8)}...
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white text-sm"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Current Stage */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium capitalize">
              {progress.stage.replace('_', ' ')}
            </span>
            <span className="text-gray-400 text-sm">
              {progress.progress}%
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">{progress.message}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
        {progress && (
          <span>
            Updated: {new Date(progress.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">Error</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={reset}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success Message */}
      {isComplete && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">
              Process completed successfully!
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Details */}
      {showDetails && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-white font-medium mb-3">Process Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-white capitalize">
                {error ? 'Failed' : isComplete ? 'Completed' : 'Running'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Started:</span>
              <span className="text-white">
                {startTime.toLocaleTimeString()}
              </span>
            </div>
            {progress && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Stage:</span>
                  <span className="text-white capitalize">
                    {progress.stage.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-white">
                    {new Date(progress.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mt-4">
            {isLoading && (
              <button
                onClick={stopPolling}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Stop Tracking
              </button>
            )}
            {!isLoading && !isComplete && (
              <button
                onClick={startPolling}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Resume Tracking
              </button>
            )}
            <button
              onClick={reset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Thinking Animation for Active Processing */}
      {isLoading && progress && !showDetails && (
        <div className="mt-4">
          <ThinkingAnimation
            stage={progress.stage.replace('_', ' ')}
            message={progress.message}
            estimatedTime={getEstimatedTime(progress.stage)}
            startTime={startTime}
          />
        </div>
      )}
    </div>
  )
}

function getEstimatedTime(stage: string): number {
  const estimates = {
    data_intake: 15,
    first_pass_analysis: 45,
    user_review: 0, // Manual step
    feedback_processing: 30,
    slide_structure: 30,
    structure_editing: 0, // Manual step
    content_generation: 120,
    chart_generation: 60,
    qa_validation: 45,
    final_export: 30
  }
  
  return estimates[stage] || 60
}

export default EnhancedProgressTracker