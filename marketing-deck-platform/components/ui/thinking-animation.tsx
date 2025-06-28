'use client'

import { useState, useEffect } from 'react'
import { Brain, Sparkles, BarChart3, FileText, CheckCircle2, Clock } from 'lucide-react'

interface ThinkingAnimationProps {
  stage: string
  message: string
  estimatedTime?: number
  startTime?: Date
}

const brainMessages = [
  "🧠 Analyzing patterns in your data...",
  "🔍 Finding hidden insights...",
  "📊 Identifying key trends...",
  "💡 Generating recommendations...",
  "🎯 Optimizing presentation flow...",
  "✨ Crafting compelling narratives...",
  "🎨 Designing visual elements...",
  "🔬 Validating findings...",
  "📈 Building charts and graphs...",
  "🎭 Perfecting the story arc..."
]

const getStageIcon = (stage: string) => {
  switch (stage.toLowerCase()) {
    case 'analysis':
    case 'data analysis':
      return <BarChart3 className="w-6 h-6" />
    case 'thinking':
    case 'processing':
      return <Brain className="w-6 h-6" />
    case 'generation':
    case 'content generation':
      return <FileText className="w-6 h-6" />
    case 'qa':
    case 'quality assurance':
      return <CheckCircle2 className="w-6 h-6" />
    default:
      return <Sparkles className="w-6 h-6" />
  }
}

export function ThinkingAnimation({ stage, message, estimatedTime = 30, startTime }: ThinkingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % brainMessages.length)
    }, 3000) // Change message every 3 seconds

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500) // Update dots every 500ms

    const timeInterval = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      } else {
        setElapsedTime(prev => prev + 1)
      }
    }, 1000) // Update time every second

    return () => {
      clearInterval(messageInterval)
      clearInterval(dotsInterval)
      clearInterval(timeInterval)
    }
  }, [startTime])

  const progress = Math.min((elapsedTime / estimatedTime) * 100, 95) // Cap at 95% until completion

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 text-center">
      {/* Animated Brain Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 mx-auto w-fit">
          {getStageIcon(stage)}
        </div>
      </div>

      {/* Stage and Message */}
      <h3 className="text-2xl font-bold text-white mb-2">
        AI Brain is Thinking{dots}
      </h3>
      <p className="text-purple-300 text-lg mb-1 capitalize">{stage}</p>
      <p className="text-gray-300 mb-6">{message}</p>

      {/* Cycling Brain Messages */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <p className="text-blue-300 animate-pulse">
          {brainMessages[currentMessageIndex]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-gray-300">
        <Clock className="w-4 h-4" />
        <span className="font-mono">{formatTime(elapsedTime)}</span>
        {estimatedTime && (
          <span className="text-gray-500">/ ~{formatTime(estimatedTime)}</span>
        )}
      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-bounce"
            style={{
              left: `${20 + (i * 10)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
    </div>
  )
}