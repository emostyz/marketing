'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  User, 
  Building, 
  Shield,
  Send,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

export default function AdminUserInvitePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_name: '',
    user_role: 'user',
    subscription_tier: 'free',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validatingAdmin, setValidatingAdmin] = useState(true)

  useEffect(() => {
    checkAdminAccess()
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
    } finally {
      setValidatingAdmin(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const adminToken = localStorage.getItem('admin_session')
      
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setFormData({
          email: '',
          full_name: '',
          company_name: '',
          user_role: 'user',
          subscription_tier: 'free',
          message: ''
        })
      } else {
        setError(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      setError('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (validatingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Validating admin access...</p>
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
                onClick={() => router.push('/admin/users')}
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
              <div className="flex items-center space-x-4">
                <UserPlus className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Invite User</h1>
                  <p className="text-gray-400">Send an invitation to join the platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
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

        {/* Invite Form */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>User Invitation Details</span>
            </CardTitle>
            <CardDescription>
              Fill out the form below to send an invitation email to a new user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                    placeholder="user@company.com"
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-gray-300">
                  Company Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              {/* Role and Subscription */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="user_role" className="text-gray-300">
                    User Role
                  </Label>
                  <select
                    id="user_role"
                    value={formData.user_role}
                    onChange={(e) => handleInputChange('user_role', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription_tier" className="text-gray-300">
                    Subscription Tier
                  </Label>
                  <select
                    id="subscription_tier"
                    value={formData.subscription_tier}
                    onChange={(e) => handleInputChange('subscription_tier', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Personal Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">
                  Personal Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Add a personal message to include in the invitation email..."
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.email}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-900/20 border-blue-500/30 mt-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-medium mb-2">How Invitations Work</h3>
                <ul className="text-blue-300/80 text-sm space-y-1">
                  <li>• An invitation email will be sent to the specified address</li>
                  <li>• The email contains a secure link to create an account</li>
                  <li>• Users can set their own password during registration</li>
                  <li>• Invited users will have the role and subscription tier you specify</li>
                  <li>• Invitations expire after 7 days for security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}