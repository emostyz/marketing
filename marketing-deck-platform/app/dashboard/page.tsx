"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  FileText, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Bell,
  HelpCircle,
  Upload
} from 'lucide-react'
import { FileBrowserModule } from '@/components/dashboard/FileBrowserModule'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')

  console.log('🏠 Dashboard render - user:', user?.email, 'loading:', loading)

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])


  // Mock user/plan/usage data for dashboard sub-header demo
  const dashboardUser = { plan: 'Pro', usage: 7, usageLimit: 10, notifications: 2 }
  const [showNotifications, setShowNotifications] = useState(false)
  const mockPresentations = [
    { id: '1', title: 'Q2 Board Update', status: 'Ready', link: '/presentation/1/preview' },
    { id: '2', title: 'Customer Insights', status: 'Processing', link: '/presentation/2/preview' }
  ]


  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <UnifiedLayout requireAuth={true}>
      {/* Dashboard Sub-Header: Only Pro Plan, Usage, Notifications */}
      <div className="w-full bg-gradient-to-r from-blue-950 via-gray-900 to-purple-950 border-b border-gray-800 shadow-md py-5 px-8 flex flex-row items-center justify-between gap-6">
        {/* Center: Pro Plan and Usage - big and prominent */}
        <div className="flex flex-row items-center gap-6 mx-auto">
          <span className="bg-blue-700 text-white text-lg px-6 py-2 rounded-full font-bold tracking-wide shadow-lg">{dashboardUser.plan || 'Free'} Plan</span>
          <span className="text-lg text-white bg-gray-800 px-6 py-2 rounded-full font-bold tracking-wide shadow-lg">Usage: {dashboardUser.usage ?? 0}/{dashboardUser.usageLimit ?? 10} presentations</span>
        </div>
        {/* Right: Notifications */}
        <div className="flex items-center gap-6 relative">
          <button className="relative text-gray-300 hover:text-white transition-colors" onClick={() => setShowNotifications(v => !v)}>
            <Bell className="w-7 h-7" />
            {dashboardUser.notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-sm rounded-full px-2 py-0.5 font-bold">{dashboardUser.notifications}</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 p-4">
              <h4 className="text-white font-bold mb-3">Latest Presentations</h4>
              <ul className="space-y-2">
                {mockPresentations.map(p => (
                  <li key={p.id} className="flex items-center justify-between">
                    <a href={p.link} className="text-blue-400 hover:underline font-medium truncate max-w-[150px]">{p.title}</a>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Ready' ? 'bg-green-700 text-white' : 'bg-yellow-700 text-yellow-200'}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {greeting}, {user.name || 'User'}! 👋
            </h2>
            <p className="text-gray-400 text-lg">
              {user.demo 
                ? "You're exploring AEDRIN in demo mode. Create up to 5 presentations with unlimited edits!"
                : "Ready to create stunning AI-powered marketing presentations?"
              }
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50 hover:border-blue-600/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <Plus className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <Sparkles className="w-5 h-5 text-blue-300 opacity-60" />
              </div>
              <h3 className="text-white font-semibold mb-2">New Presentation</h3>
              <p className="text-gray-400 text-sm mb-4">Start with AI-powered insights</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/deck-builder/new')}
              >
                Create Now
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50 hover:border-purple-600/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <Clock className="w-5 h-5 text-purple-300 opacity-60" />
              </div>
              <h3 className="text-white font-semibold mb-2">Recent Presentations</h3>
              <p className="text-gray-400 text-sm mb-4">Continue where you left off</p>
              <Button 
                variant="outline" 
                className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                onClick={() => router.push('/presentations')}
              >
                View All
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50 hover:border-green-600/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                <TrendingUp className="w-5 h-5 text-green-300 opacity-60" />
              </div>
              <h3 className="text-white font-semibold mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm mb-4">Track your performance</p>
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                onClick={() => router.push('/analytics')}
              >
                View Stats
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-700/50 hover:border-orange-600/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <Settings className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
                <Zap className="w-5 h-5 text-orange-300 opacity-60" />
              </div>
              <h3 className="text-white font-semibold mb-2">Settings</h3>
              <p className="text-gray-400 text-sm mb-4">Customize your experience</p>
              <Button 
                variant="outline" 
                className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                onClick={() => router.push('/settings')}
              >
                Configure
              </Button>
            </Card>
          </div>

          {/* Demo Mode Info */}
          {user.demo && (
            <Card className="p-6 mb-8 bg-green-900/20 border-green-700/50">
              <div className="flex items-start space-x-4">
                <Sparkles className="w-6 h-6 text-green-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-green-300 font-semibold mb-2">Demo Mode Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">What you can do:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Create up to 5 presentations</li>
                        <li>• Unlimited edits per presentation</li>
                        <li>• Access all AI features</li>
                        <li>• Use premium templates</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Demo limits:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• 24-hour session duration</li>
                        <li>• No data export</li>
                        <li>• No team collaboration</li>
                        <li>• Watermarked exports</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => router.push('/auth/signup')}
                    >
                      Upgrade to Full Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Presentations Created</p>
                  <p className="text-2xl font-bold text-white">{user.demo ? '0' : '12'}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Insights Generated</p>
                  <p className="text-2xl font-bold text-white">{user.demo ? '0' : '47'}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-white">{user.demo ? '1' : '3'}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </Card>
          </div>

          {/* Getting Started */}
          <Card className="p-8">
            <div className="text-center">
              <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                {user.demo ? 'Explore AEDRIN Demo' : 'Welcome to AEDRIN'}
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                {user.demo 
                  ? "Get started by creating your first presentation. Upload your data and let our AI generate insights and beautiful slides in minutes!"
                  : "Transform your data into compelling presentations with the power of AI. Upload your business data and watch as AEDRIN creates professional, insight-driven presentations automatically."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/deck-builder/new')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Presentation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/tutorials')}
                >
                  Watch Tutorial
                </Button>
              </div>
            </div>
          </Card>

          {/* File Browser Module */}
          <div className="mt-8">
            <FileBrowserModule />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  )
}