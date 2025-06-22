'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card as UICard } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Mic, MicOff, Send, MessageCircle, Brain, Sparkles, Lightbulb,
  ThumbsUp, ThumbsDown, Edit, RotateCcw, Play, Pause, Volume2,
  VolumeX, Settings, HelpCircle, X, CheckCircle, AlertCircle,
  Clock, User, Bot, ArrowRight, ArrowLeft, Plus, Minus,
  ChevronDown, ChevronUp, Eye, EyeOff, Target, TrendingUp
} from 'lucide-react'

export interface FeedbackMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  slideId?: string
  action?: 'suggest' | 'modify' | 'question' | 'approve' | 'reject'
  metadata?: {
    slideNumber?: number
    chartType?: string
    insight?: string
    confidence?: number
  }
}

export interface RealTimeSession {
  id: string
  status: 'active' | 'paused' | 'completed'
  currentSlide: number
  totalSlides: number
  feedback: FeedbackMessage[]
  aiSuggestions: string[]
  userPreferences: {
    style: string
    tone: string
    focus: string[]
    avoid: string[]
  }
}

interface RealTimeFeedbackProps {
  session: RealTimeSession
  onFeedback: (message: FeedbackMessage) => void
  onSuggestion: (suggestion: string) => void
  onSlideChange: (slideNumber: number) => void
  onSessionUpdate: (session: RealTimeSession) => void
  className?: string
}

export function RealTimeFeedback({
  session,
  onFeedback,
  onSuggestion,
  onSlideChange,
  onSessionUpdate,
  className = ''
}: RealTimeFeedbackProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [inputMessage, setInputMessage] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [session.feedback, scrollToBottom])

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Speech recognition error')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  // Send message
  const sendMessage = useCallback((content: string, action: FeedbackMessage['action'] = 'suggest') => {
    if (!content.trim()) return

    const message: FeedbackMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      action,
      metadata: {
        slideNumber: session.currentSlide
      }
    }

    onFeedback(message)
    setInputMessage('')
    setTranscript('')
    setIsTyping(false)
  }, [session.currentSlide, onFeedback])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }, [])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }, [inputMessage, sendMessage])

  // Quick actions
  const quickActions = [
    { label: 'Make it more visual', action: 'suggest' },
    { label: 'Add more data', action: 'suggest' },
    { label: 'Simplify this slide', action: 'suggest' },
    { label: 'Change the chart type', action: 'modify' },
    { label: 'What does this data mean?', action: 'question' },
    { label: 'I like this direction', action: 'approve' },
    { label: 'This needs work', action: 'reject' }
  ]

  // AI suggestions
  const aiSuggestions = [
    "Consider adding a trend line to show the pattern over time",
    "This data suggests we should highlight the peak performance period",
    "A comparison chart would make this insight more compelling",
    "Let's add some context about what these numbers mean for the business",
    "This slide could benefit from a call-to-action or next steps"
  ]

  // Update user preferences
  const updatePreference = useCallback((field: keyof RealTimeSession['userPreferences'], value: any) => {
    const updatedSession = {
      ...session,
      userPreferences: {
        ...session.userPreferences,
        [field]: value
      }
    }
    onSessionUpdate(updatedSession)
  }, [session, onSessionUpdate])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Real-Time Feedback</h3>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              session.status === 'active' ? 'bg-green-100 text-green-800' :
              session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {session.status}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Slide {session.currentSlide} of {session.totalSlides}</span>
            <span>{Math.round((session.currentSlide / session.totalSlides) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(session.currentSlide / session.totalSlides) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preferences Panel */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 border-b border-gray-200 px-4 py-3"
          >
            <h4 className="text-sm font-medium mb-3">Your Preferences</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Style</label>
                <select
                  value={session.userPreferences.style}
                  onChange={(e) => updatePreference('style', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Tone</label>
                <select
                  value={session.userPreferences.tone}
                  onChange={(e) => updatePreference('tone', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="analytical">Analytical</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {session.feedback.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.action && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      message.action === 'approve' ? 'bg-green-200 text-green-800' :
                      message.action === 'reject' ? 'bg-red-200 text-red-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {message.action}
                    </span>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
                {message.metadata?.slideNumber && (
                  <div className="text-xs opacity-75 mt-1">
                    Slide {message.metadata.slideNumber}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => sendMessage(action.label, action.action as any)}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-3 bg-blue-50 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-700 cursor-pointer hover:bg-blue-100 p-2 rounded"
                    onClick={() => onSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your feedback or question..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            {transcript && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800">{transcript}</span>
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            className="p-3"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim()}
            size="sm"
            className="p-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Listening...</span>
          </div>
        )}
      </div>
    </div>
  )
} 