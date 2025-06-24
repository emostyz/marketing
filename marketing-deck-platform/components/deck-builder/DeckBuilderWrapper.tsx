'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Brain, Sparkles } from 'lucide-react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { NotificationProvider } from '@/components/ui/NotificationSystem'
import FunctionalDeckBuilder from './FunctionalDeckBuilder'

interface DeckBuilderWrapperProps {
  presentationId?: string
  onSave?: (presentation: any) => void
  onExport?: (format: string) => void
}

// Loading component with beautiful animations
function DeckBuilderLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Loading Your Deck Builder
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          Preparing your world-class presentation tools...
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center space-x-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Almost ready...</span>
        </motion.div>
        
        {/* Progress indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center space-x-2"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </motion.div>
        
        {/* Feature hints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto text-xs text-gray-500"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>AI-powered insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-green-500 border-t-transparent rounded-full"
            />
            <span>Real-time collaboration</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Premium templates</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Error fallback specifically for deck builder
function DeckBuilderErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Brain className="w-8 h-8 text-red-600" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Deck Builder Temporarily Unavailable
        </h2>
        
        <p className="text-gray-600 mb-6">
          We're having trouble loading the presentation builder. Our team has been notified and we're working on a fix.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please{' '}
          <a
            href="mailto:support@aedrin.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            contact support
          </a>
        </p>
      </motion.div>
    </div>
  )
}

export default function DeckBuilderWrapper({
  presentationId,
  onSave,
  onExport
}: DeckBuilderWrapperProps) {
  return (
    <ErrorBoundary 
      fallback={<DeckBuilderErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to analytics/error reporting service
        console.error('Deck Builder Error:', error, errorInfo)
        
        // Could send to error reporting service like Sentry
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              errorBoundary: {
                componentStack: errorInfo.componentStack
              }
            },
            tags: {
              component: 'DeckBuilder',
              presentationId: presentationId || 'new'
            }
          })
        }
      }}
    >
      <NotificationProvider>
        <Suspense fallback={<DeckBuilderLoading />}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50"
          >
            <FunctionalDeckBuilder
              presentationId={presentationId}
              onSave={onSave}
              onExport={onExport}
            />
          </motion.div>
        </Suspense>
      </NotificationProvider>
    </ErrorBoundary>
  )
}