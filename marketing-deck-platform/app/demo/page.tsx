"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, Play } from 'lucide-react'

export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startDemo = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demo: true })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        console.error('Demo failed:', data.error)
        alert('Failed to start demo. Please try again.')
      }
    } catch (error) {
      console.error('Demo error:', error)
      alert('Failed to start demo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <Brain className="w-20 h-20 text-blue-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">
              Try AEDRIN Demo
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the power of AI-driven marketing decks without creating an account
            </p>
          </div>

          {/* Demo Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-400">
                Upload your data and let our AI generate insights and recommendations
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Builder</h3>
              <p className="text-gray-400">
                Create stunning presentations with our drag-and-drop editor
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <ArrowRight className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Export & Share</h3>
              <p className="text-gray-400">
                Export to PowerPoint, PDF, or share directly with your team
              </p>
            </div>
          </div>

          {/* Demo Button */}
          <div className="mb-8">
            <button
              onClick={startDemo}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting Demo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Demo Now
                </>
              )}
            </button>
          </div>

          {/* Demo Info */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-3">What's included in the demo:</h3>
            <ul className="text-gray-400 space-y-2 text-left">
              <li>• Full access to AI analysis features</li>
              <li>• Interactive presentation builder</li>
              <li>• Sample data and templates</li>
              <li>• Export functionality</li>
              <li>• 2-hour demo session</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              No account required • No credit card needed • No data stored
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-8">
            <a
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}