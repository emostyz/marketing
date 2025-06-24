'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Shield, 
  Bot, 
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Upload,
  Eye,
  EyeOff,
  Pause,
  Play,
  Trash2,
  Crown,
  UserPlus
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import SubscriptionManager from '@/lib/services/subscription-manager'
import TeamManagementService from '@/lib/services/team-management'
import UserProfileService from '@/lib/services/user-profile'
import AIProviderManager from '@/lib/services/ai-provider-manager'

interface AdminDashboardProps {
  organizationId: string
  currentUser: {
    id: string
    role: string
    permissions: string[]
  }
}

interface DashboardStats {
  users: {
    total: number
    active: number
    invited: number
    suspended: number
  }
  subscription: {
    plan: string
    status: string
    billingCycle: string
    nextBilling: Date
    usage: {
      presentations: { current: number; limit: number }
      storage: { current: number; limit: number }
      teamMembers: { current: number; limit: number }
    }
  }
  ai: {
    provider: string
    model: string
    usage: {
      requests: number
      tokens: number
      cost: number
    }
  }
  security: {
    lastSecurityScan: Date
    vulnerabilities: number
    twoFactorEnabled: number
    suspiciousActivity: number
  }
}

export function AdminDashboard({ organizationId, currentUser }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Service instances
  const subscriptionManager = new SubscriptionManager()
  const teamService = new TeamManagementService()
  const userService = new UserProfileService()
  const aiManager = new AIProviderManager()

  useEffect(() => {
    loadDashboardData()
  }, [organizationId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all dashboard data in parallel
      const [
        teamData,
        aiConfig,
        usageStats
      ] = await Promise.all([
        teamService.getTeamMembers(organizationId),
        aiManager.getOrganizationAIConfig(organizationId),
        aiManager.getProviderUsageStats(organizationId, 'month')
      ])

      setTeamMembers(teamData)

      // Mock stats for demo (in production, fetch from APIs)
      setStats({
        users: {
          total: teamData.length,
          active: teamData.filter(m => m.status === 'active').length,
          invited: teamData.filter(m => m.status === 'invited').length,
          suspended: teamData.filter(m => m.status === 'suspended').length
        },
        subscription: {
          plan: 'Enterprise',
          status: 'active',
          billingCycle: 'monthly',
          nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          usage: {
            presentations: { current: 45, limit: -1 },
            storage: { current: 12.5, limit: 500 },
            teamMembers: { current: teamData.length, limit: -1 }
          }
        },
        ai: {
          provider: aiConfig.provider?.displayName || 'OpenAI',
          model: aiConfig.model?.displayName || 'GPT-4',
          usage: {
            requests: usageStats.totalRequests,
            tokens: usageStats.totalTokens,
            cost: usageStats.totalCost
          }
        },
        security: {
          lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
          vulnerabilities: 0,
          twoFactorEnabled: teamData.filter(m => m.twoFactorEnabled).length,
          suspiciousActivity: 0
        }
      })

    } catch (error) {
      console.error('Load dashboard data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    const email = prompt('Enter email address to invite:')
    const role = prompt('Enter role (viewer, editor, admin):') || 'viewer'
    
    if (!email) return

    setActionLoading('invite')
    try {
      const result = await teamService.inviteTeamMember(
        organizationId,
        currentUser.id,
        email,
        role
      )

      if (result.success) {
        toast.success('Team member invited successfully')
        await loadDashboardData()
      } else {
        toast.error(result.error || 'Failed to invite team member')
      }
    } catch (error) {
      toast.error('Failed to invite team member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return

    setActionLoading(`remove-${memberId}`)
    try {
      const member = teamMembers.find(m => m.id === memberId)
      if (!member) return

      const result = await teamService.removeTeamMember(
        organizationId,
        member.userId,
        currentUser.id,
        'Removed by admin'
      )

      if (result.success) {
        toast.success('Team member removed')
        await loadDashboardData()
      } else {
        toast.error(result.error || 'Failed to remove team member')
      }
    } catch (error) {
      toast.error('Failed to remove team member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    setActionLoading(`role-${memberId}`)
    try {
      const member = teamMembers.find(m => m.id === memberId)
      if (!member) return

      const result = await teamService.updateMemberRole(
        organizationId,
        member.userId,
        newRole,
        currentUser.id
      )

      if (result.success) {
        toast.success('Role updated successfully')
        await loadDashboardData()
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    } finally {
      setActionLoading(null)
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-white">{stats?.users.total || 0}</p>
              <p className="text-xs text-green-400">
                {stats?.users.active || 0} active
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Subscription</p>
              <p className="text-2xl font-bold text-white">{stats?.subscription.plan}</p>
              <p className="text-xs text-green-400">{stats?.subscription.status}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">AI Usage</p>
              <p className="text-2xl font-bold text-white">{stats?.ai.usage.requests || 0}</p>
              <p className="text-xs text-blue-400">requests this month</p>
            </div>
            <Bot className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-xs text-green-400">
                {stats?.security.vulnerabilities || 0} vulnerabilities
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Presentations</span>
                <span className="text-white">
                  {stats?.subscription.usage.presentations.current || 0}
                  {stats?.subscription.usage.presentations.limit === -1 
                    ? ' / Unlimited' 
                    : ` / ${stats?.subscription.usage.presentations.limit}`
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: stats?.subscription.usage.presentations.limit === -1 
                      ? '45%' 
                      : `${((stats?.subscription.usage.presentations.current || 0) / (stats?.subscription.usage.presentations.limit || 1)) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Storage</span>
                <span className="text-white">
                  {stats?.subscription.usage.storage.current || 0}GB / {stats?.subscription.usage.storage.limit}GB
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${((stats?.subscription.usage.storage.current || 0) / (stats?.subscription.usage.storage.limit || 1)) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Team Members</span>
                <span className="text-white">
                  {stats?.subscription.usage.teamMembers.current || 0}
                  {stats?.subscription.usage.teamMembers.limit === -1 
                    ? ' / Unlimited' 
                    : ` / ${stats?.subscription.usage.teamMembers.limit}`
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ 
                    width: stats?.subscription.usage.teamMembers.limit === -1 
                      ? '25%' 
                      : `${((stats?.subscription.usage.teamMembers.current || 0) / (stats?.subscription.usage.teamMembers.limit || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Provider</span>
              <span className="text-white">{stats?.ai.provider}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Model</span>
              <span className="text-white">{stats?.ai.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly Cost</span>
              <span className="text-white">${stats?.ai.usage.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tokens Used</span>
              <span className="text-white">{stats?.ai.usage.tokens.toLocaleString()}</span>
            </div>
            <Button 
              onClick={() => setActiveTab('ai')}
              className="w-full mt-4"
              variant="outline"
            >
              Configure AI Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderTeamTab = () => (
    <div className="space-y-6">
      {/* Team Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Team Management</h3>
        <Button 
          onClick={handleInviteMember}
          disabled={actionLoading === 'invite'}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {actionLoading === 'invite' ? 'Inviting...' : 'Invite Member'}
        </Button>
      </div>

      {/* Team Members List */}
      <Card className="p-6">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {member.firstName?.[0] || member.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {member.firstName && member.lastName 
                      ? `${member.firstName} ${member.lastName}`
                      : member.email
                    }
                  </p>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.role.name === 'owner' ? 'bg-yellow-900 text-yellow-300' :
                      member.role.name === 'admin' ? 'bg-red-900 text-red-300' :
                      member.role.name === 'editor' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {member.role.displayName}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' ? 'bg-green-900 text-green-300' :
                      member.status === 'invited' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {member.role.name !== 'owner' && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role.name}
                    onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    disabled={actionLoading === `role-${member.id}`}
                    className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.firstName || member.email)}
                    disabled={actionLoading === `remove-${member.id}`}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Subscription Management</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Current Plan</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-white font-semibold">{stats?.subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400 capitalize">{stats?.subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Billing Cycle</span>
              <span className="text-white capitalize">{stats?.subscription.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Billing</span>
              <span className="text-white">
                {stats?.subscription.nextBilling.toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Plan Actions</h4>
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause Subscription
            </Button>
            <Button className="w-full" variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment Method
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Invoices
            </Button>
            <Button className="w-full text-red-400 hover:text-red-300" variant="outline">
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderAITab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">AI Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Current Configuration</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Provider</span>
              <span className="text-white">{stats?.ai.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Model</span>
              <span className="text-white">{stats?.ai.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Requests</span>
              <span className="text-white">{stats?.ai.usage.requests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Cost</span>
              <span className="text-white">${stats?.ai.usage.cost.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Available Providers</h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">OpenAI</p>
                  <p className="text-gray-400 text-sm">GPT-4, GPT-3.5 Turbo</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Anthropic Claude</p>
                  <p className="text-gray-400 text-sm">Claude 3 Opus, Sonnet</p>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Local LLM</p>
                  <p className="text-gray-400 text-sm">Enterprise Only</p>
                </div>
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">
                  Enterprise
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Security Overview</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Security Score</h4>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
            <p className="text-gray-400 text-sm">Excellent Security</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">2FA Enabled</h4>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {stats?.security.twoFactorEnabled}/{stats?.users.total}
            </div>
            <p className="text-gray-400 text-sm">Team Members</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Vulnerabilities</h4>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {stats?.security.vulnerabilities}
            </div>
            <p className="text-gray-400 text-sm">Issues Found</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Security Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Run Security Scan
          </Button>
          <Button variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            Download Security Report
          </Button>
          <Button variant="outline" className="justify-start">
            <Eye className="w-4 h-4 mr-2" />
            View Audit Logs
          </Button>
          <Button variant="outline" className="justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Configure Security Policies
          </Button>
        </div>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage your organization settings, team, and security
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'team' && renderTeamTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'security' && renderSecurityTab()}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard