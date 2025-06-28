"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [cookieMessage, setCookieMessage] = useState('')
  const router = useRouter()
  const { signIn, signInDemo, signInWithOAuth, user, loading: authLoading } = useAuth()

  // Check for cookie clearing message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const reason = urlParams.get('reason')
    
    if (reason === 'old_cookies_cleared') {
      setCookieMessage('Your session has been updated. Please log in again.')
      // Clear the URL parameter
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('reason')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])

  // Add redirect for authenticated users - but only after auth is fully loaded
  useEffect(() => {
    // Only redirect if auth is fully loaded and user is authenticated
    if (!authLoading && user && !user.demo) {
      // Check if we're not already redirecting to avoid loops
      const urlParams = new URLSearchParams(window.location.search)
      const isRedirecting = urlParams.get('redirecting') === 'true'
      const redirectTo = urlParams.get('redirect')
      
      if (!isRedirecting) {
        // Add redirecting flag to URL to prevent loops
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('redirecting', 'true')
        window.history.replaceState({}, '', newUrl.toString())
        
        // Navigate to the intended destination or dashboard
        if (redirectTo && redirectTo.startsWith('/')) {
          router.push(decodeURIComponent(redirectTo))
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        setError(result.error)
      }
      // The auth context will handle the redirect if successful
    } catch (err) {
      setError('Network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signInDemo()
      
      if (result.error) {
        setError(result.error)
      }
      // The auth context will handle the redirect if successful
    } catch (error) {
      setError('Failed to start demo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    setError('')
    
    try {
      const result = await signInWithOAuth(provider)
      
      if (result.error) {
        setError(result.error)
        setOauthLoading(null)
      }
      // OAuth redirects to callback page, so we don't need to navigate here
    } catch (error: any) {
      setError(error.message || 'OAuth login failed')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md mx-auto rounded-2xl p-8 bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <Brain className="w-12 h-12 text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome to EasyDecks.ai</h2>
          <p className="text-gray-400 text-center">AI-powered marketing decks for visionary teams</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <div>
                <p className="font-medium">Sign In Failed</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your.email@company.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/50 text-gray-400">or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {oauthLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '🔍'
            )}
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {oauthLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '🐙'
            )}
            {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/50 text-gray-400">or</span>
          </div>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading || oauthLoading !== null}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          🚀 Try Demo (No Account Required)
        </button>

        <div className="text-center text-sm">
          <div className="mb-2">
            <span className="text-gray-400">Don't have an account?</span>{' '}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </div>
          <Link href="#" className="text-gray-400 hover:text-gray-300 transition-colors text-xs">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}