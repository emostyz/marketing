"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Brain, Edit, Save, X, Upload, User, Mail, Phone, Building, 
  Briefcase, Settings, CreditCard, Crown, Zap, Star, 
  Camera, Shield, Bell, Palette, Bot, FileText, AlertCircle,
  Check, TrendingUp, Users, Database, Download
} from 'lucide-react'

interface ProfileFormData {
  name: string
  email: string
  bio: string
  phone: string
  companyName: string
  jobTitle: string
  industry: string
  targetAudience: string
  businessContext: string
  keyMetrics: string[]
  logoUrl: string
  profilePictureUrl: string
  brandColors: {
    primary: string
    secondary: string
  }
  masterSystemPrompt: string
}

interface UserSettings {
  themePreference: string
  emailNotifications: boolean
  marketingEmails: boolean
  autoSaveInterval: number
  defaultExportFormat: string
  aiAssistanceLevel: string
}

interface SubscriptionInfo {
  plan: 'starter' | 'professional' | 'enterprise'
  presentationsUsed: number
  presentationLimit: number | string
  monthlyResetDate: string
  limits: {
    presentations: number
    teamMembers: number
    features: string[]
  }
  usage: {
    presentations_created: number
    data_uploads: number
    ai_analyses: number
    exports_generated: number
    storage_used_mb: number
  }
}

const TIER_INFO = {
  starter: {
    name: 'Starter',
    price: '$29/month',
    color: 'blue',
    icon: Zap,
    features: ['5 presentations/month', 'Basic AI insights', 'Standard templates', 'PDF export', 'Email support']
  },
  professional: {
    name: 'Professional',
    price: '$99/month',
    color: 'purple',
    icon: Star,
    features: ['25 presentations/month', 'Advanced AI insights', 'Premium templates', 'PowerPoint export', 'Priority support', 'Custom branding', 'API access']
  },
  enterprise: {
    name: 'Enterprise',
    price: '$299/month',
    color: 'gold',
    icon: Crown,
    features: ['Unlimited presentations', 'Custom AI models', 'Custom templates', 'All integrations', '24/7 phone support', 'SSO integration', 'Dedicated account manager']
  }
}

export default function UserProfile() {
  const { user, updateProfile, signOut, signIn } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    industry: '',
    targetAudience: '',
    businessContext: '',
    keyMetrics: [],
    logoUrl: '',
    profilePictureUrl: '',
    brandColors: {
      primary: '#3b82f6',
      secondary: '#10b981'
    },
    masterSystemPrompt: 'You are an expert business analyst and presentation designer. Create compelling, data-driven presentations that tell a clear story and drive decision-making. Focus on key insights and actionable recommendations.'
  })

  useEffect(() => {
    fetchSubscriptionInfo()
    fetchUserSettings()
    
    if (user) {
      setFormData({
        name: (user as any).profile?.name || user.name || '',
        email: user.email || '',
        bio: (user as any).profile?.bio || '',
        phone: (user as any).profile?.phone || '',
        companyName: (user as any).profile?.companyName || '',
        jobTitle: (user as any).profile?.jobTitle || '',
        industry: (user as any).profile?.industry || '',
        targetAudience: (user as any).profile?.targetAudience || '',
        businessContext: (user as any).profile?.businessContext || '',
        keyMetrics: (user as any).profile?.keyMetrics || [],
        logoUrl: (user as any).profile?.logoUrl || '',
        profilePictureUrl: (user as any).profile?.profilePictureUrl || '',
        brandColors: (user as any).profile?.brandColors || {
          primary: '#3b82f6',
          secondary: '#10b981'
        },
        masterSystemPrompt: (user as any).profile?.masterSystemPrompt || 'You are an expert business analyst and presentation designer. Create compelling, data-driven presentations that tell a clear story and drive decision-making. Focus on key insights and actionable recommendations.'
      })
    }
  }, [user])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription info:', error)
    }
  }

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/profile/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => prev ? ({ ...prev, [key]: value }) : null)
  }

  const handleKeyMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const metrics = e.target.value.split(',').map(m => m.trim()).filter(m => m)
    setFormData(prev => ({
      ...prev,
      keyMetrics: metrics
    }))
  }

  const handleColorChange = (type: 'primary' | 'secondary', value: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: {
        ...prev.brandColors,
        [type]: value
      }
    }))
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (formData.name && formData.name.length > 100) {
      errors.push('Name must be less than 100 characters')
    }
    
    if (formData.bio && formData.bio.length > 1000) {
      errors.push('Bio must be less than 1000 characters')
    }
    
    if (formData.companyName && formData.companyName.length > 100) {
      errors.push('Company name must be less than 100 characters')
    }
    
    if (formData.jobTitle && formData.jobTitle.length > 100) {
      errors.push('Job title must be less than 100 characters')
    }
    
    if (formData.phone && formData.phone.length > 20) {
      errors.push('Phone must be less than 20 characters')
    }
    
    if (formData.masterSystemPrompt && formData.masterSystemPrompt.length > 2000) {
      errors.push('System prompt must be less than 2000 characters')
    }
    
    if (formData.profilePictureUrl && formData.profilePictureUrl.length > 0) {
      try {
        new URL(formData.profilePictureUrl)
      } catch {
        errors.push('Profile picture URL is invalid')
      }
    }
    
    if (formData.logoUrl && formData.logoUrl.length > 0) {
      try {
        new URL(formData.logoUrl)
      } catch {
        errors.push('Logo URL is invalid')
      }
    }
    
    if (formData.phone && formData.phone.includes('@')) {
      errors.push('Phone field should not contain an email address')
    }
    
    return errors
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    // Client-side validation
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Update the auth context if needed
        if (updateProfile) {
          await updateProfile(formData)
        }
      } else {
        // Handle detailed validation errors from API
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join('. '))
        } else {
          setError(data.error || 'Failed to update profile')
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSave = async () => {
    if (!settings) return

    setLoading(true)
    try {
      const response = await fetch('/api/user/profile/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themePreference: settings.themePreference,
          emailNotifications: settings.emailNotifications,
          marketingEmails: settings.marketingEmails,
          autoSaveInterval: settings.autoSaveInterval,
          defaultExportFormat: settings.defaultExportFormat,
          aiAssistanceLevel: settings.aiAssistanceLevel
        })
      })

      if (response.ok) {
        setSuccess('Settings updated successfully!')
      } else {
        setError('Failed to update settings')
      }
    } catch (error) {
      setError('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = async (newPlan: 'professional' | 'enterprise') => {
    setLoading(true)
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll just update the subscription directly
      const response = await fetch('/api/user/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan })
      })

      if (response.ok) {
        setSuccess(`Successfully upgraded to ${TIER_INFO[newPlan].name}!`)
        await fetchSubscriptionInfo()
        setShowUpgradePrompt(false)
      } else {
        setError('Failed to upgrade subscription')
      }
    } catch (error) {
      setError('Failed to upgrade subscription')
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {formData.profilePictureUrl ? (
              <img src={formData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true} // Email typically can't be changed
                  className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Contact & Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Your job title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Context */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Business Context</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., C-level executives, marketing managers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Metrics (comma-separated)</label>
            <input
              type="text"
              value={formData.keyMetrics.join(', ')}
              onChange={handleKeyMetricsChange}
              disabled={!isEditing}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Revenue, conversion rate, customer acquisition cost"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Context</label>
          <textarea
            name="businessContext"
            value={formData.businessContext}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Describe your business context, goals, and what you want to achieve with presentations..."
          />
        </div>
      </div>

      {/* AI System Prompt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Brain Configuration
        </h3>
        <p className="text-gray-400 text-sm">Customize how the AI assistant behaves and responds to your needs.</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Master System Prompt</label>
          <textarea
            name="masterSystemPrompt"
            value={formData.masterSystemPrompt}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={6}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-mono text-sm"
            placeholder="Define how the AI should behave and what expertise it should demonstrate..."
          />
        </div>
      </div>

      {/* Branding */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Branding
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.brandColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  disabled={!isEditing}
                  className="w-12 h-10 rounded border border-gray-600 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={formData.brandColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.brandColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  disabled={!isEditing}
                  className="w-12 h-10 rounded border border-gray-600 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={formData.brandColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionTab = () => {
    if (!subscription) return <div>Loading subscription info...</div>

    const currentTier = TIER_INFO[subscription.plan]
    const TierIcon = currentTier.icon

    return (
      <div className="space-y-8">
        {/* Current Plan */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-${currentTier.color}-600 flex items-center justify-center`}>
                <TierIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentTier.name} Plan</h3>
                <p className="text-gray-400">{currentTier.price}</p>
              </div>
            </div>
            
            {subscription.plan !== 'enterprise' && (
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Presentations</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {subscription.presentationsUsed}
                <span className="text-lg text-gray-400">
                  /{subscription.presentationLimit === -1 ? '∞' : subscription.presentationLimit}
                </span>
              </div>
              {subscription.presentationLimit !== -1 && (
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min((subscription.presentationsUsed / (subscription.presentationLimit as number)) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Data Uploads</span>
              </div>
              <div className="text-2xl font-bold text-white">{subscription.usage.data_uploads}</div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Exports</span>
              </div>
              <div className="text-2xl font-bold text-white">{subscription.usage.exports_generated}</div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Current Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {subscription.plan !== 'enterprise' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Upgrade Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(TIER_INFO)
                .filter(([plan]) => plan !== subscription.plan && plan !== 'starter')
                .map(([plan, info]) => {
                  const PlanIcon = info.icon
                  return (
                    <div key={plan} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-full bg-${info.color}-600 flex items-center justify-center`}>
                          <PlanIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{info.name}</h4>
                          <p className="text-gray-400">{info.price}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        {info.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <Check className="w-3 h-3 text-green-400" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {info.features.length > 4 && (
                          <p className="text-gray-400 text-sm">+ {info.features.length - 4} more features</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleUpgradePlan(plan as 'professional' | 'enterprise')}
                        disabled={loading}
                        className={`w-full bg-${info.color}-600 hover:bg-${info.color}-700 text-white py-2 rounded-lg transition-all disabled:opacity-50`}
                      >
                        {loading ? 'Processing...' : `Upgrade to ${info.name}`}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSettingsTab = () => {
    if (!settings) return <div>Loading settings...</div>

    return (
      <div className="space-y-8">
        {/* Preferences */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
              <select
                value={settings.themePreference}
                onChange={(e) => handleSettingsChange('themePreference', e.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default Export Format</label>
              <select
                value={settings.defaultExportFormat}
                onChange={(e) => handleSettingsChange('defaultExportFormat', e.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="pptx">PowerPoint</option>
                <option value="png">PNG Images</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Auto-save Interval (seconds)</label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.autoSaveInterval}
                onChange={(e) => handleSettingsChange('autoSaveInterval', parseInt(e.target.value))}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AI Assistance Level</label>
              <select
                value={settings.aiAssistanceLevel}
                onChange={(e) => handleSettingsChange('aiAssistanceLevel', e.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="minimal">Minimal</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="maximum">Maximum</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Email Notifications</h4>
                <p className="text-gray-400 text-sm">Receive updates about your presentations and account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Marketing Emails</h4>
                <p className="text-gray-400 text-sm">Receive news, tips, and product updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingsChange('marketingEmails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>

          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all">
              <h4 className="text-white font-medium">Change Password</h4>
              <p className="text-gray-400 text-sm">Update your account password</p>
            </button>

            <button
              onClick={signOut}
              className="w-full text-left p-4 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-all border border-red-800"
            >
              <h4 className="text-red-400 font-medium">Sign Out</h4>
              <p className="text-gray-400 text-sm">Sign out of your account</p>
            </button>
          </div>
        </div>

        <button
          onClick={handleSettingsSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Brain className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-white">Get Started with EasyDecks.ai</h2>
        <p className="text-gray-400 mb-6 max-w-xl">Sign up or log in to create your profile, save your decks, and unlock powerful AI-driven marketing presentations.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">🚀 Get Started</a>
          <a href="/auth/login" className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">🔑 Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {formData.profilePictureUrl ? (
                  <img src={formData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{formData.name || user.email}</h1>
                <p className="text-gray-400">{user.email}</p>
                {subscription && (
                  <span className={`inline-block bg-${TIER_INFO[subscription.plan].color}-600 text-white text-xs px-2 py-1 rounded-full mt-1`}>
                    {TIER_INFO[subscription.plan].name} Plan
                  </span>
                )}
              </div>
            </div>
            
            {activeTab === 'profile' && (
              !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Messages */}
        <div className="p-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  )
}