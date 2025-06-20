'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  User, 
  Building2, 
  Target, 
  Save, 
  Upload, 
  ArrowLeft,
  Mail,
  Crown,
  Shield,
  Camera
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

interface ProfileForm {
  full_name: string
  company: string
  position: string
  goals: string
  avatar_url: string
}

export default function SettingsPage() {
  const { user, profile, updateProfile, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<ProfileForm>({
    full_name: '',
    company: '',
    position: '',
    goals: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        position: profile.position || '',
        goals: profile.goals || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await updateProfile(formData)
      
      if (error) {
        toast.error(error)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    try {
      // For now, we'll use a placeholder URL
      // In production, this would upload to Supabase Storage
      const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name || 'User')}`
      
      setFormData(prev => ({ ...prev, avatar_url: placeholderUrl }))
      toast.success('Avatar uploaded! (Using placeholder for demo)')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const getSubscriptionBadge = (status: string) => {
    const badges = {
      free: { icon: User, label: 'Free Plan', color: 'bg-gray-600' },
      pro: { icon: Crown, label: 'Pro Plan', color: 'bg-blue-600' },
      enterprise: { icon: Shield, label: 'Enterprise', color: 'bg-purple-600' }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.free
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences to help our brain provide better insights.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1 p-6 bg-gray-800/50 border-gray-700">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={formData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name || 'User')}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-gray-600"
                />
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-1">
                {formData.full_name || 'Your Name'}
              </h3>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">{profile.email}</span>
              </div>
              
              <div className="mb-4">
                {getSubscriptionBadge(profile.subscription_status)}
              </div>
              
              {formData.company && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{formData.company}</span>
                </div>
              )}
              
              {formData.position && (
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{formData.position}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Settings Form */}
          <Card className="lg:col-span-2 p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Position/Role
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your job title or role"
                />
              </div>

              {/* Business Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Business Goals & Objectives
                  </div>
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe your key business goals, objectives, and what you hope to achieve with data analysis. This helps our brain provide more targeted insights."
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 This information helps our brain understand your context and provide more relevant strategic insights.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Current Plan</span>
                {getSubscriptionBadge(profile.subscription_status)}
              </div>
              <p className="text-sm text-gray-400">
                {profile.subscription_status === 'free' 
                  ? 'Upgrade to Pro for unlimited presentations and advanced features.'
                  : 'You have access to all premium features.'
                }
              </p>
              <Button variant="outline" size="sm" className="w-full">
                {profile.subscription_status === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Brain Analysis Language</span>
                <select className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Default Chart Style</span>
                <select className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600">
                  <option>Professional</option>
                  <option>Corporate</option>
                  <option>Analytics</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}