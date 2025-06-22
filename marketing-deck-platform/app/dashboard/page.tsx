"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, Upload, BarChart3, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  subscription?: string
  demo?: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for demo session
        const demoSession = document.cookie.includes('demo-session')
        
        if (demoSession) {
          setUser({
            id: 'demo-user-123',
            email: 'demo@aedrin.com',
            name: 'Demo User',
            subscription: 'pro',
            demo: true
          })
          setLoading(false)
          return
        }

        // Check for regular session
        const response = await fetch('/api/user/dashboard')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // No valid session, redirect to login
          router.push('/auth/login')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
        return
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      if (user?.demo) {
        // Clear demo session
        document.cookie = 'demo-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      } else {
        // Regular sign out
        await fetch('/api/auth/logout', { method: 'POST' })
      }
      
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-white">AEDRIN Dashboard</h1>
              {user.demo && (
                <span className="ml-3 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                  DEMO MODE
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-400">
            {user.demo 
              ? "You're in demo mode. Explore AEDRIN's features without creating an account."
              : "Ready to create your next AI-powered marketing deck?"
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/deck-builder/new" className="group">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-all group-hover:border-blue-500">
              <Plus className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Create New Deck</h3>
              <p className="text-gray-400">Start building your AI-powered presentation</p>
            </div>
          </Link>

          <Link href="/upload" className="group">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-all group-hover:border-blue-500">
              <Upload className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Data</h3>
              <p className="text-gray-400">Import your data for AI analysis</p>
            </div>
          </Link>

          <Link href="/templates" className="group">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-all group-hover:border-blue-500">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Browse Templates</h3>
              <p className="text-gray-400">Choose from professional templates</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {user.demo ? (
            <div className="text-gray-400">
              <p>Demo mode - no recent activity to display</p>
              <p className="text-sm mt-2">
                Create a real account to track your presentations and analytics.
              </p>
            </div>
          ) : (
            <div className="text-gray-400">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start by creating your first presentation!</p>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        {user.demo && (
          <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Demo Mode Active</h3>
            <p className="text-blue-200 mb-4">
              You're currently exploring AEDRIN in demo mode. Your changes won't be saved.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Account
              </Link>
              <Link 
                href="/pricing"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}