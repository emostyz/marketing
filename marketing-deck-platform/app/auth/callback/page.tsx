"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import OAuthManager from '@/lib/auth/oauth-config'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading')
        
        // Handle the OAuth callback
        const session = await OAuthManager.handleAuthCallback()
        
        if (session) {
          setStatus('success')
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          setStatus('error')
          setError('Authentication failed. Please try again.')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setError(error.message || 'Authentication failed. Please try again.')
      }
    }

    handleCallback()
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In</h2>
          <p className="text-gray-400">Please wait while we set up your account...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="text-center">
        <Brain className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to AEDRIN!</h2>
        <p className="text-gray-400">Redirecting you to your dashboard...</p>
      </div>
    </div>
  )
}