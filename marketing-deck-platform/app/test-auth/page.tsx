"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const { user, loading, signIn } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    console.log('🧪 TestAuthPage render - user:', user?.email, 'loading:', loading)
  }, [user, loading])

  const testSignIn = async () => {
    try {
      setTestResult('Testing sign in...')
      console.log('🧪 Testing sign in with test@aedrin.com')
      
      const result = await signIn('test@aedrin.com', 'password123')
      
      if (result.error) {
        setTestResult(`❌ Sign in failed: ${result.error}`)
        console.error('❌ Sign in failed:', result.error)
      } else {
        setTestResult('✅ Sign in successful!')
        console.log('✅ Sign in successful')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`)
      console.error('❌ Error:', error)
    }
  }

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setSessionInfo({ error: error.message })
      } else {
        setSessionInfo({
          hasSession: !!session,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          accessToken: session?.access_token ? 'Present' : 'Missing'
        })
      }
    } catch (error) {
      setSessionInfo({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>User Name:</strong> {user?.name || 'None'}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testSignIn}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Test Sign In (test@aedrin.com)
            </button>
            
            <button
              onClick={checkSession}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded ml-4"
            >
              Check Supabase Session
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <p className={testResult.includes('❌') ? 'text-red-400' : 'text-green-400'}>
              {testResult}
            </p>
          </div>
        )}

        {sessionInfo && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Session Info</h2>
            <pre className="text-sm bg-gray-900 p-2 rounded overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 block">
              → Go to Dashboard
            </a>
            <a href="/auth/login" className="text-blue-400 hover:text-blue-300 block">
              → Go to Login Page
            </a>
            <a href="/" className="text-blue-400 hover:text-blue-300 block">
              → Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 