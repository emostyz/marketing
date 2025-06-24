'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Upload, 
  Eye, 
  Download,
  Calendar,
  Activity,
  Globe,
  Clock,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalPresentations: number
    totalUploads: number
    totalExports: number
    activeUsers: number
    averageSessionTime: string
    topFeature: string
  }
  userGrowth: Array<{
    date: string
    newUsers: number
    totalUsers: number
  }>
  presentationStats: Array<{
    template: string
    usageCount: number
    successRate: number
  }>
  featureUsage: Array<{
    feature: string
    usageCount: number
    percentage: number
  }>
  geographicData: Array<{
    country: string
    userCount: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    user: string
    action: string
    timestamp: string
    success: boolean
  }>
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${timeRange}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting analytics:', error)
      alert('Failed to export analytics')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
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
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
                  <p className="text-gray-400">Detailed insights and metrics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button 
                onClick={exportAnalytics}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error}</p>
              <Button onClick={loadAnalytics} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalUsers)}</p>
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
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalPresentations)}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Data Uploads</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.overview.totalUploads)}</p>
                    </div>
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">{formatNumber(analytics.overview.activeUsers)}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Growth */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    User Growth
                  </CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.userGrowth.slice(-7).map((data, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-gray-400 text-sm">{data.date}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-white font-medium">+{data.newUsers}</span>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (data.newUsers / Math.max(...analytics.userGrowth.map(d => d.newUsers))) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Usage */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Template Usage
                  </CardTitle>
                  <CardDescription>Most popular templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.presentationStats.slice(0, 6).map((template, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-white font-medium">{template.template}</span>
                          <p className="text-gray-400 text-xs">{template.successRate}% success rate</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-400 font-medium">{template.usageCount}</span>
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${template.successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage & Geographic Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Usage */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Feature Usage
                  </CardTitle>
                  <CardDescription>Most used platform features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.featureUsage.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-white font-medium">{feature.feature}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400 text-sm">{feature.percentage}%</span>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${feature.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-green-400 font-medium">{formatNumber(feature.usageCount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>Users by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.geographicData.slice(0, 8).map((country, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-white font-medium">{country.country}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400 text-sm">{country.percentage}%</span>
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${country.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-orange-400 font-medium">{formatNumber(country.userCount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Stream */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity Stream
                </CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${activity.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-gray-400 text-sm">by {activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`${activity.success ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'} mb-1`}
                        >
                          {activity.type}
                        </Badge>
                        <p className="text-gray-400 text-sm">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300"
                    onClick={() => router.push('/admin/activity')}
                  >
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Insights */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Key Insights
                </CardTitle>
                <CardDescription>Platform performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {analytics.overview.averageSessionTime}
                    </div>
                    <p className="text-gray-400">Average Session Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {analytics.overview.topFeature}
                    </div>
                    <p className="text-gray-400">Most Popular Feature</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {formatNumber(analytics.overview.totalExports)}
                    </div>
                    <p className="text-gray-400">Total Exports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}