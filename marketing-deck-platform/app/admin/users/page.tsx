'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Shield, 
  Eye, 
  Ban, 
  ArrowLeft,
  Crown,
  User,
  Calendar,
  Mail,
  Building,
  Activity,
  MoreVertical,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  full_name: string
  company_name?: string
  user_role: string
  subscription_tier: string
  subscription_status: string
  onboarding_completed: boolean
  created_at: string
  last_login?: string
  total_presentations: number
  total_uploads: number
  is_active: boolean
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
    loadUsers()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const adminToken = localStorage.getItem('admin_session')
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/auth/check', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (!response.ok) {
        router.push('/admin/login')
        return
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('admin_session')
      
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'promote' | 'demote' | 'delete' | 'activate' | 'deactivate') => {
    try {
      const adminToken = localStorage.getItem('admin_session')
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        await loadUsers()
      } else {
        setError(data.error || 'Action failed')
      }
    } catch (error) {
      setError('Failed to perform action')
    }
  }

  const handleBulkAction = async (action: 'delete' | 'export') => {
    if (selectedUsers.length === 0) return

    try {
      const adminToken = localStorage.getItem('admin_session')
      
      if (action === 'export') {
        const response = await fetch('/api/admin/users/export', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedUsers })
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          setSuccess('Users exported successfully')
        }
      } else if (action === 'delete') {
        const response = await fetch('/api/admin/users/bulk', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedUsers })
        })

        if (response.ok) {
          setSuccess(`${selectedUsers.length} users deleted`)
          setSelectedUsers([])
          await loadUsers()
        }
      }
    } catch (error) {
      setError('Bulk action failed')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.user_role === filterRole
    const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600 text-white"><Crown className="w-3 h-3 mr-1" />Admin</Badge>
      case 'user':
        return <Badge variant="outline" className="border-gray-600 text-gray-300"><User className="w-3 h-3 mr-1" />User</Badge>
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">{role}</Badge>
    }
  }

  const getSubscriptionBadge = (tier: string, status: string) => {
    const isActive = status === 'active'
    const color = tier === 'enterprise' ? 'purple' : tier === 'pro' ? 'blue' : 'gray'
    
    return (
      <Badge 
        className={`${isActive ? `bg-${color}-600` : `bg-gray-600`} text-white`}
      >
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading users...</p>
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
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <p className="text-gray-400">{filteredUsers.length} users displayed</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/admin/users/invite')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <Button variant="ghost" onClick={() => setError(null)} className="ml-auto">×</Button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
            <Button variant="ghost" onClick={() => setSuccess(null)} className="ml-auto">×</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by email, name, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">{selectedUsers.length} users selected</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('export')}
                      className="border-blue-500 text-blue-400"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      className="border-red-500 text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        {error ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error}</p>
              <Button onClick={loadUsers} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u.id))
                            } else {
                              setSelectedUsers([])
                            }
                          }}
                          className="rounded border-gray-600"
                        />
                      </th>
                      <th className="text-left p-4 text-gray-300 font-medium">User</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Subscription</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Activity</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="rounded border-gray-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.full_name || 'No Name'}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              {user.company_name && (
                                <p className="text-gray-500 text-xs flex items-center">
                                  <Building className="w-3 h-3 mr-1" />
                                  {user.company_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(user.user_role)}
                        </td>
                        <td className="p-4">
                          {getSubscriptionBadge(user.subscription_tier, user.subscription_status)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-white">{user.total_presentations} presentations</p>
                            <p className="text-gray-400">{user.total_uploads} uploads</p>
                            <div className="flex items-center mt-1">
                              <Activity className="w-3 h-3 mr-1 text-gray-500" />
                              <span className={`text-xs ${user.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-white flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(user.created_at)}
                            </p>
                            {user.last_login && (
                              <p className="text-gray-400 text-xs">
                                Last: {formatDate(user.last_login)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {user.user_role === 'user' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'promote')}
                                className="border-green-500 text-green-400"
                              >
                                <Shield className="w-3 h-3" />
                              </Button>
                            )}
                            {user.user_role === 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'demote')}
                                className="border-yellow-500 text-yellow-400"
                              >
                                <User className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                              className="border-gray-500 text-gray-400"
                            >
                              <Activity className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="border-red-500 text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No users found</p>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}