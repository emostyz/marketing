'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Database,
  Globe,
  Lock,
  Eye,
  UserPlus,
  Layout,
  Download
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalPresentations: number
  totalUploads: number
  activeUsers: number
  newUsersToday: number
  presentationsToday: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  storageUsed: string
  apiCalls: number
}

interface RecentActivity {
  id: string
  type: string
  user: string
  action: string
  timestamp: string
  details?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Check for admin session token
      const adminToken = localStorage.getItem('admin_session')
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/auth/check', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()

      if (!response.ok || !data.isAdmin) {
        localStorage.removeItem('admin_session')
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      setAdminUser(data.admin)
      await loadDashboardData()
    } catch (error) {
      console.error('Error checking admin access:', error)
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      const adminToken = localStorage.getItem('admin_session')
      const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }

      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/activity/recent', { headers })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem('admin_session')
      if (adminToken) {
        await fetch('/api/admin/auth/login', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        })
      }
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    }
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400 bg-green-900/20'
      case 'warning': return 'text-yellow-400 bg-yellow-900/20'
      case 'critical': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Platform Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                {adminUser?.full_name || 'Admin Access'}
              </Badge>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Platform
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-red-500 text-red-400 hover:bg-red-500/10">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats ? formatNumber(stats.totalUsers) : '---'}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Presentations</p>
                  <p className="text-2xl font-bold text-white">{stats ? formatNumber(stats.totalPresentations) : '---'}</p>
                </div>
                <FileText className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Today</p>
                  <p className="text-2xl font-bold text-white">{stats ? formatNumber(stats.activeUsers) : '---'}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">System Health</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stats?.systemHealth === 'healthy' ? 'bg-green-400' : stats?.systemHealth === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <p className="text-white font-semibold capitalize">{stats?.systemHealth || 'Unknown'}</p>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Management */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">New Today</p>
                  <p className="text-xl font-bold text-green-400">+{stats?.newUsersToday || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Active</p>
                  <p className="text-xl font-bold text-blue-400">{stats?.activeUsers || 0}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => router.push('/admin/users')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Users
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300"
                  onClick={() => router.push('/admin/users/invite')}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Management */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Layout className="w-5 h-5" />
                <span>Template Management</span>
              </CardTitle>
              <CardDescription>Create and manage presentation templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Active Templates</p>
                  <p className="text-xl font-bold text-purple-400">12</p>
                </div>
                <div>
                  <p className="text-gray-400">Usage Today</p>
                  <p className="text-xl font-bold text-green-400">48</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => router.push('/admin/templates')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Manage
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300"
                  onClick={() => router.push('/admin/templates/new')}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/admin/settings')}
                className="w-full bg-gray-700 hover:bg-gray-600"
              >
                Configure Platform
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/admin/analytics')}
                className="w-full bg-blue-700 hover:bg-blue-600"
              >
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="w-5 h-5" />
                <span>Data Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/admin/export')}
                className="w-full bg-green-700 hover:bg-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest user and system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-gray-400 text-sm">by {activity.user}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{activity.timestamp}</p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 mt-4"
                  onClick={() => router.push('/admin/activity')}
                >
                  View All Activity
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}