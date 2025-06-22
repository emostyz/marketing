"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const router = useRouter()
  const { signUp, signInWithOAuth } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signUp(name, email, password, company)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push('/welcome')
      }
    } catch (err) {
      setError('Network error occurred')
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'github' | 'microsoft') => {
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
      setError(error.message || 'OAuth signup failed')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md mx-auto rounded-2xl p-8 bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <Brain className="w-12 h-12 text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-white">Join AEDRIN</h2>
          <p className="text-gray-400 text-center">Create your account to get started</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              Company (Optional)
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignup('google')}
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
            onClick={() => handleOAuthSignup('github')}
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
          <button
            onClick={() => handleOAuthSignup('microsoft')}
            disabled={loading || oauthLoading !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {oauthLoading === 'microsoft' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '🏢'
            )}
            {oauthLoading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
          </button>
        </div>

        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}