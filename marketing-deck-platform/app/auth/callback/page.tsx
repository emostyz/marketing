'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OAuthManager } from '@/lib/auth/oauth-config'
import { Card } from '@/components/ui/Card'
import { Brain, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await OAuthManager.handleAuthCallback()
        
        if (session) {
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Brain className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          )}
        </div>

        <h1 className="text-xl font-semibold mb-4">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Welcome to AEDRIN!'}
          {status === 'error' && 'Authentication Error'}
        </h1>

        <p className="text-gray-400 text-sm">
          {message}
        </p>

        {status === 'loading' && (
          <div className="mt-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}