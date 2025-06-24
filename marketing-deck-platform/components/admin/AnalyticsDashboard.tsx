'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  FileText, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Activity,
  Zap,
  Clock,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

interface UsageMetrics {
  totalPresentations: number
  presentationsThisMonth: number
  totalAIRequests: number
  aiRequestsThisMonth: number
  totalUsers: number
  activeUsersThisMonth: number
  totalDataProcessed: number
  averageProcessingTime: number
  successRate: number
  topIndustries: Array<{ industry: string; count: number }>
  topFeatures: Array<{ feature: string; count: number }>
  userGrowthTrend: Array<{ date: string; users: number }>
  usageTrend: Array<{ date: string; presentations: number; aiRequests: number }>
}

interface AIUsageAnalytics {
  providerId: string
  providerName: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  totalTokensUsed: number
  totalCost: number
  popularModels: Array<{ model: string; requests: number }>
  errorTypes: Array<{ error: string; count: number }>
  peakUsageHours: Array<{ hour: number; requests: number }>
}

interface PresentationAnalytics {
  totalPresentations: number
  completedPresentations: number
  draftPresentations: number
  averageSlidesPerPresentation: number
  popularTemplates: Array<{ template: string; count: number }>
  industryBreakdown: Array<{ industry: string; count: number }>
  presentationSizes: Array<{ sizeRange: string; count: number }>
  completionRate: number
  timeToComplete: number
  userSatisfactionScore: number
}

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null)
  const [aiAnalytics, setAIAnalytics] = useState<AIUsageAnalytics[]>([])
  const [presentationAnalytics, setPresentationAnalytics] = useState<PresentationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'presentations' | 'ai' | 'users'>('overview')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load usage metrics
      const usageResponse = await fetch(`/api/admin/analytics?type=usage&timeRange=${timeRange}&organizationId=${user?.current_organization_id}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsageMetrics(usageData.data)
      }

      // Load AI analytics
      const aiResponse = await fetch(`/api/admin/analytics?type=ai_providers&timeRange=${timeRange}&organizationId=${user?.current_organization_id}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        setAIAnalytics(aiData.data)
      }

      // Load presentation analytics
      const presentationResponse = await fetch(`/api/admin/analytics?type=presentations&timeRange=${timeRange}&organizationId=${user?.current_organization_id}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      
      if (presentationResponse.ok) {
        const presentationData = await presentationResponse.json()
        setPresentationAnalytics(presentationData.data)
      }

    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async (format: 'csv' | 'json' | 'xlsx', dataType: 'all' | 'users' | 'presentations' | 'ai_usage') => {
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          action: 'export',
          organizationId: user?.current_organization_id,
          format,
          dataType,
          timeRange
        })
      })

      const result = await response.json()

      if (result.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
        toast.success('Analytics exported successfully')
      } else {
        toast.error(result.error || 'Export failed')
      }

    } catch (error) {
      toast.error('Failed to export analytics')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Presentations</p>
              <p className="text-2xl font-bold text-white">{usageMetrics?.totalPresentations || 0}</p>
              <p className="text-green-400 text-sm">+{usageMetrics?.presentationsThisMonth || 0} this month</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AI Requests</p>
              <p className="text-2xl font-bold text-white">{usageMetrics?.totalAIRequests || 0}</p>
              <p className="text-green-400 text-sm">+{usageMetrics?.aiRequestsThisMonth || 0} this month</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">{usageMetrics?.activeUsersThisMonth || 0}</p>
              <p className="text-gray-400 text-sm">of {usageMetrics?.totalUsers || 0} total</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">{usageMetrics?.successRate || 0}%</p>
              <p className="text-green-400 text-sm">{usageMetrics?.averageProcessingTime || 0}ms avg</p>
            </div>
            <Target className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Top Industries and Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Industries
          </h3>
          <div className="space-y-3">
            {usageMetrics?.topIndustries.map((industry, index) => (
              <div key={industry.industry} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="text-white">{industry.industry}</span>
                </div>
                <span className="text-gray-400">{industry.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Popular Features
          </h3>
          <div className="space-y-3">
            {usageMetrics?.topFeatures.map((feature, index) => (
              <div key={feature.feature} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="text-white">{feature.feature}</span>
                </div>
                <span className="text-gray-400">{feature.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage Trends
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
          <p className="text-gray-400">Chart visualization would go here</p>
        </div>
      </Card>
    </div>
  )

  const renderPresentationsTab = () => (
    <div className="space-y-6">
      {/* Presentation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Presentations</p>
              <p className="text-2xl font-bold text-white">{presentationAnalytics?.totalPresentations || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{presentationAnalytics?.completedPresentations || 0}</p>
            </div>
            <Award className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{presentationAnalytics?.completionRate || 0}%</p>
            </div>
            <Target className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Time to Complete</p>
              <p className="text-2xl font-bold text-white">{presentationAnalytics?.timeToComplete || 0}h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Presentation Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Industry Breakdown</h3>
          <div className="space-y-3">
            {presentationAnalytics?.industryBreakdown.slice(0, 5).map((industry, index) => (
              <div key={industry.industry} className="flex items-center justify-between">
                <span className="text-white">{industry.industry}</span>
                <span className="text-gray-400">{industry.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Templates</h3>
          <div className="space-y-3">
            {presentationAnalytics?.popularTemplates.slice(0, 5).map((template, index) => (
              <div key={template.template} className="flex items-center justify-between">
                <span className="text-white">{template.template}</span>
                <span className="text-gray-400">{template.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Presentation Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {presentationAnalytics?.presentationSizes.map((size) => (
            <div key={size.sizeRange} className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-white">{size.count}</p>
              <p className="text-gray-400 text-sm">{size.sizeRange}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderAITab = () => (
    <div className="space-y-6">
      {/* AI Provider Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {aiAnalytics.map((provider) => (
          <Card key={provider.providerId} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{provider.providerName}</h3>
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Requests</span>
                <span className="text-white">{provider.totalRequests}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className={`${provider.successfulRequests / provider.totalRequests > 0.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {Math.round((provider.successfulRequests / provider.totalRequests) * 100)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="text-white">{provider.averageResponseTime}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-white">${provider.totalCost}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens Used</span>
                <span className="text-white">{provider.totalTokensUsed.toLocaleString()}</span>
              </div>
            </div>

            {provider.errorTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Top Errors</h4>
                <div className="space-y-1">
                  {provider.errorTypes.slice(0, 3).map((error) => (
                    <div key={error.error} className="flex justify-between text-sm">
                      <span className="text-red-400 truncate">{error.error}</span>
                      <span className="text-gray-400">{error.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* AI Usage Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          AI Usage Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {aiAnalytics.reduce((sum, p) => sum + p.totalRequests, 0)}
            </p>
            <p className="text-gray-400">Total Requests</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {aiAnalytics.reduce((sum, p) => sum + p.totalTokensUsed, 0).toLocaleString()}
            </p>
            <p className="text-gray-400">Total Tokens</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              ${aiAnalytics.reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}
            </p>
            <p className="text-gray-400">Total Cost</p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">User Analytics Coming Soon</h3>
        <p className="text-gray-400">
          Detailed user analytics including engagement metrics, feature usage, and user journey analysis will be available in the next update.
        </p>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-gray-400">Platform usage and performance insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={() => exportAnalytics('csv', 'all')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'presentations', label: 'Presentations', icon: FileText },
          { id: 'ai', label: 'AI Usage', icon: Brain },
          { id: 'users', label: 'Users', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'presentations' && renderPresentationsTab()}
        {activeTab === 'ai' && renderAITab()}
        {activeTab === 'users' && renderUsersTab()}
      </motion.div>
    </div>
  )
}