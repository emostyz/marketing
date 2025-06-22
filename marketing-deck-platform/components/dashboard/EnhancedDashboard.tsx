"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Brain, FileText, Upload, BarChart3, Settings, Users, Activity, Search } from 'lucide-react'

interface DashboardData {
  profile: any
  recent_presentations: any[]
  recent_data_imports: any[]
  analytics: any
  subscription: any
}

export default function EnhancedDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/user/dashboard')
      const result = await response.json()

      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.error || 'Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    try {
      const response = await fetch('/api/user/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_data',
          data: { query: searchQuery }
        })
      })

      const result = await response.json()

      if (result.success) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error('Error searching data:', error)
    }
  }

  const handleFeedback = async (rating: number, feedback: string) => {
    try {
      await fetch('/api/user/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_feedback',
          data: {
            feedback_type: 'dashboard_experience',
            rating,
            title: 'Dashboard Experience',
            description: feedback
          }
        })
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {dashboardData.profile?.company_name || 'User'}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your presentations and data
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search presentations, data files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSearch} className="px-6">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-white">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.presentations?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Presentations</h3>
                  <div className="space-y-2">
                    {searchResults.presentations.map((presentation: any) => (
                      <div key={presentation.id} className="p-3 bg-gray-800 rounded">
                        <div className="text-white font-medium">{presentation.title}</div>
                        <div className="text-gray-400 text-sm">{presentation.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.dataImports?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Data Files</h3>
                  <div className="space-y-2">
                    {searchResults.dataImports.map((dataImport: any) => (
                      <div key={dataImport.id} className="p-3 bg-gray-800 rounded">
                        <div className="text-white font-medium">{dataImport.file_name}</div>
                        <div className="text-gray-400 text-sm">{dataImport.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Presentations</CardTitle>
              <FileText className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData.analytics?.total_presentations || 0}
              </div>
              <p className="text-xs text-gray-400">
                {dashboardData.recent_presentations?.length || 0} recent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Data Files</CardTitle>
              <Upload className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData.analytics?.total_data_files || 0}
              </div>
              <p className="text-xs text-gray-400">
                {dashboardData.recent_data_imports?.length || 0} recent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Exports</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardData.analytics?.total_exports || 0}
              </div>
              <p className="text-xs text-gray-400">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Session Time</CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Math.round((dashboardData.analytics?.total_session_time || 0) / 60)}h
              </div>
              <p className="text-xs text-gray-400">
                Total time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Presentations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Presentations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_presentations?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_presentations.map((presentation: any) => (
                      <div key={presentation.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{presentation.title}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(presentation.last_edited_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                            {presentation.status}
                          </span>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No presentations yet</p>
                    <Button className="mt-4">Create Your First Presentation</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Data Imports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-green-400" />
                  Recent Data Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_data_imports?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recent_data_imports.map((dataImport: any) => (
                      <div key={dataImport.id} className="p-3 bg-gray-800 rounded">
                        <div className="text-white font-medium text-sm">{dataImport.file_name}</div>
                        <div className="text-gray-400 text-xs">
                          {new Date(dataImport.uploaded_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded mt-1 inline-block">
                          {dataImport.processing_status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No data files yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {dashboardData.subscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-400" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-white font-medium">{dashboardData.subscription.plan_name}</div>
                      <div className="text-gray-400 text-sm">{dashboardData.subscription.status}</div>
                    </div>
                    {dashboardData.subscription.current_usage && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Usage this month:</div>
                        {Object.entries(dashboardData.subscription.current_usage).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-400">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    New Presentation
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Collaborator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">How was your experience?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFeedback(rating, 'Dashboard experience feedback')}
                      className="p-2 hover:bg-gray-700 rounded"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Additional feedback..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 