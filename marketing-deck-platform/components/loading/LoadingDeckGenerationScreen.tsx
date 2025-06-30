/**
 * Enhanced Loading Screen for Deck Generation
 * Shows real-time progress with beautiful animations
 * Compatible with both existing and enhanced AI pipelines
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, BarChart3, Layout, Sparkles, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface LoadingStep {
  id: string
  label: string
  description: string
  icon: React.ComponentType<any>
  estimatedDuration?: number
}

interface LoadingDeckGenerationScreenProps {
  deckId?: string
  steps?: LoadingStep[]
  progressEventSource?: string
  onComplete?: (deckId: string) => void
  onError?: (error: string) => void
  enableEnhanced?: boolean
}

const DEFAULT_STEPS: LoadingStep[] = [
  {
    id: 'analyzing',
    label: 'Analyzing Data',
    description: 'Processing your dataset with advanced AI algorithms',
    icon: Brain,
    estimatedDuration: 15000
  },
  {
    id: 'planning',
    label: 'Planning Structure',
    description: 'Creating intelligent slide outlines and narratives',
    icon: Layout,
    estimatedDuration: 10000
  },
  {
    id: 'chart_building',
    label: 'Building Charts',
    description: 'Generating professional data visualizations',
    icon: BarChart3,
    estimatedDuration: 8000
  },
  {
    id: 'composing',
    label: 'Composing Slides',
    description: 'Assembling your world-class presentation',
    icon: Sparkles,
    estimatedDuration: 12000
  }
]

const ENHANCED_STEPS: LoadingStep[] = [
  {
    id: 'analyzing',
    label: 'Enhanced Analysis',
    description: 'Running Python-powered statistical analysis and pattern detection',
    icon: Brain,
    estimatedDuration: 20000
  },
  {
    id: 'planning',
    label: 'AI Structure Planning',
    description: 'Using GPT-4 to create executive-level presentation structure',
    icon: Layout,
    estimatedDuration: 15000
  },
  {
    id: 'chart_building',
    label: 'Intelligent Charts',
    description: 'Building Tremor-powered charts with consulting-grade styling',
    icon: BarChart3,
    estimatedDuration: 12000
  },
  {
    id: 'composing',
    label: 'Professional Composition',
    description: 'Assembling with absolute positioning and executive theming',
    icon: Sparkles,
    estimatedDuration: 15000
  }
]

export default function LoadingDeckGenerationScreen({
  deckId,
  steps,
  progressEventSource,
  onComplete,
  onError,
  enableEnhanced = false
}: LoadingDeckGenerationScreenProps) {
  const [currentStep, setCurrentStep] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)
  
  const activeSteps = steps || (enableEnhanced ? ENHANCED_STEPS : DEFAULT_STEPS)
  
  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [startTime])
  
  // Estimate time remaining
  useEffect(() => {
    if (currentStep && !completedSteps.has(currentStep)) {
      const currentStepIndex = activeSteps.findIndex(step => step.id === currentStep)
      if (currentStepIndex !== -1) {
        const remainingSteps = activeSteps.slice(currentStepIndex)
        const totalRemaining = remainingSteps.reduce((sum, step) => sum + (step.estimatedDuration || 10000), 0)
        setEstimatedTimeRemaining(totalRemaining)
      }
    }
  }, [currentStep, completedSteps, activeSteps])
  
  // Set up SSE connection for real-time progress
  useEffect(() => {
    if (!deckId || !progressEventSource) return
    
    console.log(`📡 Connecting to progress stream: ${progressEventSource}`)
    
    const eventSource = new EventSource(`${progressEventSource}?deckId=${deckId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📊 Progress update:', data)
        
        switch (data.type) {
          case 'connected':
            console.log('✅ Progress stream connected')
            break
            
          case 'progress':
            setCurrentStep(data.step)
            setCurrentMessage(data.message || '')
            
            // Mark previous steps as completed
            const currentIndex = activeSteps.findIndex(step => step.id === data.step)
            if (currentIndex > 0) {
              const newCompleted = new Set(completedSteps)
              for (let i = 0; i < currentIndex; i++) {
                newCompleted.add(activeSteps[i].id)
              }
              setCompletedSteps(newCompleted)
            }
            
            // Handle completion
            if (data.step === 'done') {
              const allCompleted = new Set(activeSteps.map(step => step.id))
              setCompletedSteps(allCompleted)
              setTimeout(() => {
                onComplete?.(deckId)
              }, 1500)
            }
            break
            
          case 'error':
            setError(data.message || 'Generation failed')
            onError?.(data.message || 'Generation failed')
            break
            
          case 'timeout':
            setError('Generation timed out. Please try again.')
            onError?.(data.message || 'Generation timed out')
            break
        }
      } catch (parseError) {
        console.error('Failed to parse progress data:', parseError)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('Progress stream error:', error)
      setError('Lost connection to progress stream')
    }
    
    return () => {
      console.log('📡 Closing progress stream')
      eventSource.close()
    }
  }, [deckId, progressEventSource, onComplete, onError, activeSteps, completedSteps])
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds}s`
  }
  
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'pending' => {
    if (completedSteps.has(stepId)) return 'completed'
    if (currentStep === stepId) return 'current'
    return 'pending'
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generation Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {enableEnhanced ? 'Enhanced AI Generation' : 'Generating Your Presentation'}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {enableEnhanced 
              ? 'Using advanced Python analysis and GPT-4 intelligence'
              : 'Creating your world-class presentation with AI'
            }
          </p>
          
          {/* Time indicators */}
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            {estimatedTimeRemaining && (
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>~{formatTime(estimatedTimeRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="space-y-4">
          {activeSteps.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-green-50 border border-green-200' 
                    : status === 'current' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-green-500' 
                    : status === 'current' 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  <AnimatePresence mode="wait">
                    {status === 'completed' ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        animate={status === 'current' ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className={`w-6 h-6 ${
                          status === 'current' ? 'text-white' : 'text-gray-500'
                        }`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    status === 'completed' 
                      ? 'text-green-900' 
                      : status === 'current' 
                      ? 'text-blue-900' 
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm ${
                    status === 'completed' 
                      ? 'text-green-700' 
                      : status === 'current' 
                      ? 'text-blue-700' 
                      : 'text-gray-500'
                  }`}>
                    {status === 'current' && currentMessage ? currentMessage : step.description}
                  </p>
                </div>
                
                {status === 'current' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                  />
                )}
              </motion.div>
            )
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((completedSteps.size / activeSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.size / activeSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Enhancement Badge */}
        {enableEnhanced && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200"
          >
            <div className="flex items-center justify-center space-x-2 text-purple-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Enhanced AI Pipeline Active</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}