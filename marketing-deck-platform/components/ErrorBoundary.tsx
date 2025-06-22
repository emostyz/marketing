'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} />
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-red-400">Something went wrong</h1>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-500/20">
              <h2 className="text-xl font-semibold mb-2">Error Details:</h2>
              <pre className="text-sm text-gray-300 overflow-auto">
                {this.state.error?.message}
              </pre>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-400">Stack Trace</summary>
                <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 