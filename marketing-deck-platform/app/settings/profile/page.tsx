'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import { 
  User, 
  Building2, 
  Target, 
  Save, 
  Camera,
  ArrowLeft,
  Mail,
  Crown,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

interface ExtendedProfileForm {
  full_name: string
  company: string
  position: string
  goals: string
  avatar_url: string
  phone: string
  location: string
  website: string
  bio: string
  joined_date: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<ExtendedProfileForm>({
    full_name: '',
    company: '',
    position: '',
    goals: '',
    avatar_url: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
    joined_date: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || '',
        company: '',
        position: '',
        goals: '',
        avatar_url: '',
        phone: '',
        location: '',
        website: '',
        bio: '',
        joined_date: new Date().toLocaleDateString()
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Mock profile update
      const error = null
      
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

  return (
    <UnifiedLayout requireAuth={true} className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="p-6">
        <Toaster position="top-right" />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/settings">
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-400">Manage your detailed profile information and public presence.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-1 p-6 bg-gray-800/50 border-gray-700">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <img
                    src={formData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name || 'User')}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-gray-600"
                  />
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {formData.full_name || 'Your Name'}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{user?.email}</span>
                </div>
                
                <div className="mb-4">
                  {getSubscriptionBadge('free')}
                </div>
                
                {formData.company && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{formData.company}</span>
                  </div>
                )}
                
                {formData.position && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{formData.position}</span>
                  </div>
                )}

                {formData.location && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{formData.location}</span>
                  </div>
                )}

                {formData.joined_date && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {formData.joined_date}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-3 p-6 bg-gray-800/50 border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Edit Profile</h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
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
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full rounded-lg bg-gray-600 border border-gray-600 px-4 py-3 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed from profile</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio and Goals */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">About</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

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
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-700">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  )
}