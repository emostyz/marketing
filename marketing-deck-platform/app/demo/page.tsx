'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Brain, Loader2 } from 'lucide-react'

export default function DemoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signInDemo } = useAuth()

  useEffect(() => {
    const startDemo = async () => {
      try {
        setLoading(true)
        const result = await signInDemo()
        
        if (result.error) {
          setError(result.error)
          setLoading(false)
        } else {
          // Redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        setError('Failed to start demo')
        setLoading(false)
      }
    }

    startDemo()
  }, [signInDemo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-2xl font-bold text-white mb-4">Setting up your demo...</h1>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading AEDRIN demo experience</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-md mx-auto text-center p-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-4">Demo Failed</h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}